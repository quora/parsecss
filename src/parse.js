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

/**
 * Parses CSS StyleSheets into useful data structures.
 */
var postcss = require('postcss');
var helpers = require('./helpers');
var _ = require('underscore');

/**
 * Given a CSS stylesheet, returns an object with the following key-values:
 * - fontfaceCss: A list of @font-face rules
 * - keyframes: A list of tuples @keyframes rules that map from their identifier
 *     to their css declaration.
 * - globalCss: A list of css (strings) that don't apply to any classes
 * - classListCssPairs:  A list of tuples of css that apply to classes. Each
 *     tuple is a pair where the first element is a list of css classes that are
 *     in the rule's selector. The second element is the css for the rule.
 *  @param {String} contents
 *  @return {Object}
 */
exports.parseCSS = function(contents) {
    var root = postcss.parse(contents);

    var globalCss = [];
    var fontfaceCss = [];
    var keyframesCss = [];
    var classListCssPairs = [];
    var classNames;
    var cssString;

    // We special case 2 types of @rules: font-face and keyframes.
    root.walkAtRules(function(atRule) {
        // @font-face rules are split into their own section since they are
        // almost always critical and required to fetch the fonts as soon as
        // possible.
        if (helpers.isFontFaceAtRule(atRule)) {
            fontfaceCss.push(helpers.ruleToString(atRule));
        }
        // @keyframes are parsed out so that critical keyframes can be
        // conditionally included on the page.
        if (helpers.isKeyFrameAtRule(atRule)) {
            // @keyframes fadeIn {...} => ['faceIn', '@keyframes fadeIn {...}']
            keyframesCss.push([atRule.params, helpers.ruleToString(atRule)]);
        }
    });

    root.walkRules(function(rule) {
        // If rule.selectors contain multiple selectors that all either point to
        // the same class list or don't reference any class list, don't split
        // them.
        var noClasses = helpers.selectorToClassNames(rule.selector).length === 0;
        var classLists = _.map(rule.selectors, function(selector) {
            return _.uniq(helpers.selectorToClassNames(selector));
        });
        var sameClasses = _.every(classLists, function(classList) {
            return _.isEqual(classList, classLists[0]);
        });

        // Split rules into individual selectors otherwise.
        // Eg. a,b {} => a {} and b {}
        var selectors = (noClasses || sameClasses) ? [rule.selector] : rule.selectors;
        selectors.forEach(function(selector) {
            classNames = _.uniq(helpers.selectorToClassNames(selector));

            // Ignore non @media at rules - we consider rules within @media nodes
            // as regular rules because we want to wrap each of them separately.
            if (rule.parent != root && !helpers.isMediaAtRule(rule.parent)) {
                return;
            }

            cssString = helpers.ruleToString(rule.clone({selector: selector}), rule.parent);
            if (classNames.length !== 0) {
                classListCssPairs.push([classNames, cssString]);
            } else {
                globalCss.push(cssString);
            }
        });
    });

    var retval = {};
    if (globalCss.length !== 0) {
        retval.globalCss = globalCss;
    }
    if (fontfaceCss.length !== 0) {
        retval.fontfaceCss = fontfaceCss;
    }
    if (keyframesCss.length !== 0) {
        retval.keyframesCss = keyframesCss;
    }
    if (classListCssPairs.length !== 0) {
        retval.classListCssPairs = classListCssPairs;
    }
    return retval;
};
