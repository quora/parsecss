/**
 * Copyright 2016 Quora, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

 /* global describe, it */
var expect = require('expect.js'),
    path = require('path'),
    fs = require('fs'),
    childProcess = require('child_process');

var BIN_PARSE_CSS = path.resolve(__dirname, '../bin/parsecss'),
    TEST_CSS_FILE = path.resolve(__dirname, 'test.css'),
    CMD_TIMEOUT = 2000;

describe('bin/parsecss', function() {
    it('-h should respond with a helpful message', function(done) {
        childProcess.execFile(BIN_PARSE_CSS, ['-h'], {
            timeout: CMD_TIMEOUT,
        }, function(error, stdout, stderr) {
            expect(error).to.be(null);
            expect(stderr).to.be.eql('');
            expect(stdout).to.contain('Usage: bin/parsecss <options>');
            done();
        });
    });

    it('should fail if you pass a file without the -f flag', function(done) {
        childProcess.execFile(BIN_PARSE_CSS, [TEST_CSS_FILE], {
            timeout: CMD_TIMEOUT,
        }, function(error, stdout, stderr) {
            expect(stderr).to.be.contain('Use the -f flag to specifiy an input file!');
            done();
        });
    });

    it('should work when passed a file via the -f flag', function(done) {
        childProcess.execFile(BIN_PARSE_CSS, ['-f', TEST_CSS_FILE], {
            timeout: CMD_TIMEOUT,
        }, function(error, stdout, stderr) {
            expect(error).to.be(null);
            expect(stderr).to.be.eql('');
            expect(stdout).to.contain('classListCssPairs');

            var parsedOutput = JSON.parse(stdout);
            expect(parsedOutput).to.have.key('classListCssPairs');

            var pairs = parsedOutput['classListCssPairs'];
            expect(pairs).to.have.length(2);
            done();
        });
    });

    it('should work when passed a file via stdin', function(done) {
        var child = childProcess.execFile(BIN_PARSE_CSS, [], {
            timeout: CMD_TIMEOUT,
        }, function(error, stdout, stderr) {
            expect(error).to.be(null);
            expect(stderr).to.be.eql('');
            expect(stdout).to.contain('classListCssPairs');

            var parsedOutput = JSON.parse(stdout);
            expect(parsedOutput).to.have.key('classListCssPairs');

            var pairs = parsedOutput['classListCssPairs'];
            expect(pairs).to.have.length(2);
            done();
        });
        child.stdin.write(fs.readFileSync(TEST_CSS_FILE));
        child.stdin.end();
    });
});
