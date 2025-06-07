'use strict';

const {
  ObjectID
} = require('mongodb');

module.exports = function (app, myDataBase) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
      myDataBase.find({
        project: project
      }).toArray((err, issues) => {
        if (err) {
          return res.status(500).json({
            error: 'Database error'
          });
        }
        res.status(200).json(issues);
      })
    })

    .post(function (req, res) {
      let project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.body;
      const issue = {
        project: project,
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      }

      myDataBase.insertOne(issue, (err, result) => {
        if (err) {
          return res.status(500).json({
            error: 'Database error'
          });
        }
        res.status(201).json({
          message: 'Issue created successfully',
          issue: result.ops[0]
        });
      })
    })

    .put(function (req, res) {
      let project = req.params.project;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open
      } = req.body;
      if (!_id) {
        return res.status(400).json({
          error: 'Missing _id'
        });
      }
      if (!ObjectID.isValid(_id)) {
        return res.status(200).json({
          error: "could not update",
          _id
        });
      }
      const updateFields = {};
      issue_title ? updateFields.issue_title = issue_title : null;
      issue_text ? updateFields.issue_text = issue_text : null;
      created_by ? updateFields.created_by = created_by : null;
      assigned_to ? updateFields.assigned_to = assigned_to : null;
      status_text ? updateFields.status_text = status_text : null;
      open !== undefined ? updateFields.open = open : null;

      updateFields.updated_on = new Date();
      myDataBase.updateOne({
          _id: new ObjectID(_id),
          project: project
        }, {
          $set: updateFields
        },
        (err, result) => {
          if (err) {
            return res.status(500).json({
              error: 'Database error'
            });
          }
          if (result.matchedCount === 0) {
            return res.status(404).json({
              error: 'Issue not found',
              id: _id
            });
          }
          res.status(200).json({
            message: 'Issue updated successfully',
            issue: updateFields
          });
        }
      );

    })

    .delete(function (req, res) {
      let project = req.params.project;
      const {
        _id
      } = req.body;
      if (!_id || !ObjectID.isValid(_id)) {
        return res.status(400).json({
          error: 'Missing _id'
        });
      }
      myDataBase.deleteOne({
          _id: ObjectID(_id),
          project: project
        },
        (err, result) => {
          if (err) {
            return res.status(500).json({
              error: 'Database error'
            });
          }
          if (result.deletedCount === 0) {
            return res.status(404).json({
              error: 'Issue not found'
            });
          }
          res.status(200).json({
            message: 'successfully deleted',
            _id
          });
        }
      );
    });

};