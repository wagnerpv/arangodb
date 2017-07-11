/* jshint globalstrict:true, strict:true, maxlen: 5000 */
/* global describe, before, after, it, require*/

// //////////////////////////////////////////////////////////////////////////////
// / @brief tests for user access rights
// /
// / @file
// /
// / DISCLAIMER
// /
// / Copyright 2017 ArangoDB GmbH, Cologne, Germany
// /
// / Licensed under the Apache License, Version 2.0 (the "License");
// / you may not use this file except in compliance with the License.
// / You may obtain a copy of the License at
// /
// /     http://www.apache.org/licenses/LICENSE-2.0
// /
// / Unless required by applicable law or agreed to in writing, software
// / distributed under the License is distributed on an "AS IS" BASIS,
// / WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// / See the License for the specific language governing permissions and
// / limitations under the License.
// /
// / Copyright holder is ArangoDB GmbH, Cologne, Germany
// /
// / @author Michael Hackstein
// / @author Copyright 2017, ArangoDB GmbH, Cologne, Germany
// //////////////////////////////////////////////////////////////////////////////

'use strict';

const expect = require('chai').expect;
const users = require('@arangodb/users');
const helper = require('@arangodb/user-helper');
const errors = require('@arangodb').errors;
const namePrefix = helper.namePrefix;
const dbName = helper.dbName;
const colName = helper.colName;
const rightLevels = helper.rightLevels;
const testColName = `${namePrefix}ColNew`;

const userSet = helper.userSet;
const systemLevel = helper.systemLevel;
const dbLevel = helper.dbLevel;
const colLevel = helper.colLevel;
const activeUsers = helper.activeUsers;
const inactiveUsers = helper.inactiveUsers;

const arango = require('internal').arango;
const db = require('internal').db;
for (let l of rightLevels) {
  systemLevel[l] = new Set();
  dbLevel[l] = new Set();
  colLevel[l] = new Set();
}

const switchUser = (user, db) => {
  arango.reconnect(arango.getEndpoint(), db, user, '');
};


switchUser('root', '_system');
helper.removeAllUsers();
helper.generateAllUsers();

describe('User Rights Management', () => {

  after(helper.removeAllUsers);

  it('should check if all users are created', () => {
    switchUser('root', '_system');
    expect(userSet.size).to.equal(4 * 4 * 4 * 2);
    for (let name of userSet) {
      expect(users.document(name), `Could not find user: ${name}`).to.not.be.undefined;
    }
  });

  describe('should test rights for', () => {

    for (let name of userSet) {
      let canUse = false;
      try {
        switchUser(name, dbName);
        canUse = true;
      } catch (e) {
        canUse = false;
      }

      if (canUse) {

        describe(`user ${name}`, () => {

          before(() => {
            switchUser(name, dbName);
          });

          describe('update on collection level', () => {

            const rootTestCollection = (switchBack = true) => {
              switchUser('root', dbName);
              let col = db._collection(testColName);
              if (switchBack) {
                switchUser(name, dbName);
              }
              return col !== null;
            };

            const rootDropCollection = () => {
              if (rootTestCollection(false)) {
                db._drop(testColName);
              }
              switchUser(name, dbName);
            };

            const rootCreateCollection = () => {
              if (!rootTestCollection(false)) {
                let col = db._create(testColName);
                col.save({_key: "123"});
                col.save({_key: "456"});
                col.save({_key: "789"});
                col.save({_key: "987"});
                col.save({_key: "654"});
                col.save({_key: "321"});
              }
              switchUser(name, dbName);
            };

            const rootCount = () => {
              let count = -1;
              if (rootTestCollection(false)) {
                count = db._collection(testColName).count();
              }
              // else: Collection not there
              switchUser(name, dbName);
              return count;
            };


            describe('truncate a collection', () => {
              before(() => {
                db._useDatabase(dbName);
                rootCreateCollection();
              });

              after(() => {
                rootDropCollection();
              });

              it('via js', () => {
                expect(rootTestCollection()).to.equal(true, `Precondition failed, the collection does not exist`);
                let col = db._collection(testColName);
                expect(rootCount()).to.equal(6, `Precondition failed, too few documents.`);
                if (activeUsers.has(name) &&
                   (dbLevel['rw'].has(name) || dbLevel['ro'].has(name)) &&
                   colLevel['rw'].has(name)) {
                  // User needs ro on database
                  col.truncate();
                  expect(rootCount()).to.equal(0, `${name} could not truncate the collection with sufficient rights`);
                } else {
                  try {
                    col.truncate();
                    expect(true).to.be(false, `${name} succeeded with truncate without getting an error (insufficent rights)`);
                  } catch (e) {
                    expect(e.errorNum).to.equal(errors.ERROR_FORBIDDEN.code);
                  }
                  expect(rootCount()).to.equal(6, `${name} could not truncate the collection with sufficient rights`);
                }
              });
            });
          });
        });
      }
    }
  });
});


