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
    parse = require('../src/parse');

describe('parseCSS', function() {
    it('should return an empty object - empty', function() {
        expect(parse.parseCSS('')).to.be.eql({});
    });

    it('should correctly split global and classList css', function() {
        var css = [
            'a { color: blue; }',
            'a.link { color: red; }'
        ].join('');
        expect(parse.parseCSS(css)).to.be.eql({
            globalCss: ['a{color:blue}'],
            classListCssPairs: [
                [['link'], 'a.link{color:red}']
            ]
        });
    });

    it('should correctly handle multiple similar classList css', function() {
        var css = [
            '.link { color: blue; display: none; }',
            'a.link { color: red; }'
        ].join('');
        expect(parse.parseCSS(css)).to.be.eql({
            classListCssPairs: [
                [['link'], '.link{color:blue;display:none}'],
                [['link'], 'a.link{color:red}']
            ]
        });
    });

    it('should not split multiple selectors with similar classList css', function() {
        var css = '.link:before,.link a { color: blue; display: none; }';
        expect(parse.parseCSS(css)).to.be.eql({
            classListCssPairs: [
                [['link'], '.link:before,.link a{color:blue;display:none}']
            ]
        });
    });

    it('should correctly handle @media at rules', function() {
        var css = [
            '@media screen {',
            '.link { color: blue; display: none; }',
            '}',
            'a.link { color: red; }'
        ].join('');
        expect(parse.parseCSS(css)).to.be.eql({
            classListCssPairs: [
                [['link'], '@media screen{.link{color:blue;display:none}}'],
                [['link'], 'a.link{color:red}']
            ]
        });
    });

    it('should correctly handle @fontface at rules', function() {
        var css = [
            '@font-face{',
            'font-family:\'q-icons\';',
            'src:url(\'/static/fonts/q-icons/q-icons.eot\')',
            '}'
        ].join('');
        expect(parse.parseCSS(css)).to.be.eql({fontfaceCss: [css]});
    });

    it('should corretly handle @keyframes at rules', function() {
        var css = [
            '@keyframes fadeOut{',
            'from{opacity:1}',
            'to{opacity:0}',
            '}'
        ].join('');
        expect(parse.parseCSS(css)).to.be.eql({
            keyframesCss: [
                ['fadeOut', css]
            ]
        });
    });

    it('should corretly handle vendor prefixed @keyframes at rules', function() {
        var css1 = [
            '@keyframes fadeOut{',
            'from{opacity:1}',
            'to{opacity:0}',
            '}'
        ].join('');
        var css2 = [
            '@-webkit-keyframes fadeOut{',
            'from{opacity:1}',
            'to{opacity:0}',
            '}'
        ].join('');
        expect(parse.parseCSS(css1 + '\n' + css2)).to.be.eql({
            keyframesCss: [
                ['fadeOut', css1],
                ['fadeOut', css2]
            ]
        });
    });
});
