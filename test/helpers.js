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

/* global describe, it, beforeEach */
var expect = require('expect.js'),
    postcss = require('postcss'),
    helpers = require('../src/helpers');

describe('is*AtRule', function () {
    var nonAtRule;
    var mediaRule;
    var keyFramesRule;
    var webkitKeyFramesRule;
    var fontFaceRule;

    beforeEach(function () {
        nonAtRule = postcss.parse('a {}').first;
        mediaRule = postcss.parse('@media screen {}').first;
        keyFramesRule = postcss.parse('@keyframes fadeIn {}').first;
        webkitKeyFramesRule = postcss.parse('@-webkit-keyframes fadeIn {}').first;
        fontFaceRule = postcss.parse('@font-face {}').first;
    });

    describe('isKeyFrameAtRule', function () {
        it('should return false for @media nodes', function () {
            expect(helpers.isKeyFrameAtRule(mediaRule)).to.be(false);
        });

        it('should return false for @fontface nodes', function () {
            expect(helpers.isKeyFrameAtRule(fontFaceRule)).to.be(false);
        });

        it('should return false for non at rule nodes', function () {
            expect(helpers.isKeyFrameAtRule(nonAtRule)).to.be(false);
        });

        it('should return true for @keyframes nodes', function () {
            expect(helpers.isKeyFrameAtRule(keyFramesRule)).to.be(true);
        });

        it('should return true for @-webkit-keyframes nodes', function () {
            expect(helpers.isKeyFrameAtRule(webkitKeyFramesRule)).to.be(true);
        });
    });

    describe('isMediaAtRule', function () {
        it('should return true for @media nodes', function () {
            expect(helpers.isMediaAtRule(mediaRule)).to.be(true);
        });

        it('should return false for @fontface nodes', function () {
            expect(helpers.isMediaAtRule(fontFaceRule)).to.be(false);
        });

        it('should return false for non at rule nodes', function () {
            expect(helpers.isMediaAtRule(nonAtRule)).to.be(false);
        });

        it('should return false for @keyframes nodes', function () {
            expect(helpers.isMediaAtRule(keyFramesRule)).to.be(false);
            expect(helpers.isMediaAtRule(webkitKeyFramesRule)).to.be(false);
        });
    });

    describe('isFontFaceAtRule', function () {
        it('should return false for @media nodes', function () {
            expect(helpers.isFontFaceAtRule(mediaRule)).to.be(false);
        });

        it('should return true for @fontface nodes', function () {
            expect(helpers.isFontFaceAtRule(fontFaceRule)).to.be(true);
        });

        it('should return false for non at rule nodes', function () {
            expect(helpers.isFontFaceAtRule(nonAtRule)).to.be(false);
        });

        it('should return false for @keyframes nodes', function () {
            expect(helpers.isFontFaceAtRule(keyFramesRule)).to.be(false);
            expect(helpers.isFontFaceAtRule(webkitKeyFramesRule)).to.be(false);
        });
    });
});

describe('selectorToClassNames', function () {
    it('should return an empty list when there are none', function () {
        expect(helpers.selectorToClassNames('a')).to.be.eql([]);
        expect(helpers.selectorToClassNames('#link')).to.be.eql([]);
        expect(helpers.selectorToClassNames('div:hover')).to.be.eql([]);
    });

    it('should return a list of classnames - one class', function () {
        expect(helpers.selectorToClassNames('.a')).to.be.eql(['a']);
        expect(helpers.selectorToClassNames('.b')).to.be.eql(['b']);
        expect(helpers.selectorToClassNames('.b-c')).to.be.eql(['b-c']);
        expect(helpers.selectorToClassNames('.b_c-d')).to.be.eql(['b_c-d']);
    });

    it('should return a list of classnames - multiple classes', function () {
        expect(helpers.selectorToClassNames('.a.b.c')).to.be.eql(['a', 'b', 'c']);
        expect(helpers.selectorToClassNames('.a .b .c')).to.be.eql(['a', 'b', 'c']);
    });

    it('should handle a mix of tags and classes', function () {
        expect(helpers.selectorToClassNames('a.link')).to.be.eql(['link']);
        expect(helpers.selectorToClassNames('footer .link')).to.be.eql(['link']);
    });

    it('should handle a mix of ids and classes', function () {
        expect(helpers.selectorToClassNames('#link.link')).to.be.eql(['link']);
        expect(helpers.selectorToClassNames('#link .link')).to.be.eql(['link']);
    });

    it('should handle attributes - eg a[attr=x]', function () {
        expect(helpers.selectorToClassNames('.link[target="_blank"]')).to.be.eql(['link']);
        expect(helpers.selectorToClassNames('a[target="_blank"]')).to.be.eql([]);
    });

    it('should handle pseudo selectors', function () {
        expect(helpers.selectorToClassNames('.link:hover')).to.be.eql(['link']);
        expect(helpers.selectorToClassNames('a:hover')).to.be.eql([]);
    });

    it('should handle pseudo selectors with additional classes', function () {
        expect(helpers.selectorToClassNames('.link:hover .partial')).to.be.eql(['link', 'partial']);
        expect(helpers.selectorToClassNames('a:hover .partial')).to.be.eql(['partial']);
    });

    // TODO: Why wouldn't I want .no to be detected?
    it.skip('should handle :not() selectors', function () {
        expect(helpers.selectorToClassNames('.link:not(.no)')).to.be.eql(['link']);
    });
});

describe('ruleToString', function () {
    var rule;

    it('should handle simple standalone rules', function () {
        rule = postcss.parse('a {color:red;}').first;
        expect(helpers.ruleToString(rule)).to.be.eql('a{color:red}');

        rule = postcss.parse('.link {display: none;}').first;
        expect(helpers.ruleToString(rule)).to.be.eql('.link{display:none}');
    });

    it('should handle rules with multiple declarations', function () {
        rule = postcss.parse('.link {display: none; color: blue;}').first;
        expect(helpers.ruleToString(rule)).to.be.eql('.link{display:none;color:blue}');
    });

    it('should handle @media rules', function () {
        var css = [
            '@media screen and (max-width: 434px) {',
            '.NavHeader .mweb {',
            'padding-left: 5px;',
            'padding-right: 10px;',
            '}',
            '}'
        ].join('');
        var minifiedCss = [
            '@media screen and (max-width:434px){',
            '.NavHeader .mweb{',
            'padding-left:5px;',
            'padding-right:10px',
            '}',
            '}'
        ].join('');
        var parentNode = postcss.parse(css).first;
        rule = parentNode.nodes[0];
        expect(helpers.ruleToString(rule, parentNode)).to.be.eql(minifiedCss);
    });
});
