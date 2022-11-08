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
 * parsecss helpers.
 */
var cssmin = require('cssmin');
var CLASS_NAME_RE = /\.([a-zA-Z0-9_-]+)/g;

/**
 * Returns whether a given node is a @keyframe node.
 * @param {Node} node
 * @return {Boolean}
 */
exports.isKeyFrameAtRule = function (node) {
    return node.type == 'atrule' && node.name.indexOf('keyframes') != -1;
};

/**
 * Returns whether a given node is a @media node.
 * @param {Node} node
 * @return {Boolean}
 */
var isMediaAtRule = exports.isMediaAtRule = function (node) {
    return node.type == 'atrule' && node.name == 'media';
};

/**
 * Returns whether a given node is a @font-face node.
 * @param {Node} node
 * @return {Boolean}
 */
exports.isFontFaceAtRule = function (node) {
    return node.type == 'atrule' && node.name == 'font-face';
};

/**
 * Given a selector string, return a list of classnames in the selector.
 * @param {String} selector
 * @return {Array.<String>}
 */
exports.selectorToClassNames = function (selector) {
    var names = [];
    var result;
    while ((result = CLASS_NAME_RE.exec(selector)) !== null) {
        names.push(result[1]);
    }
    return names;
};

/**
 * Given a Rule, return its string representation.
 * @param {Rule} rule
 * @param {Node} parentNode The parent node of the rule. If undefined, rule is
 *   assumed to be a top-level node.
 * @return {String}
 */
exports.ruleToString = function (rule, parentNode) {
    var ruleString = rule.toString();

    if (parentNode && isMediaAtRule(parentNode)) {
        ruleString = [
            '@', parentNode.name, ' ',  // @media
            parentNode.params,          // screen and (max-width ...)
            ' {', ruleString, '}'        // { .. }
        ].join('');
    }

    return cssmin(ruleString);
};
