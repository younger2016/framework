/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-07-18T16:53:19+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: .eslintrc.js
 * @Last modified by:   xf
 * @Last modified time: 2017-07-19T14:52:29+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

module.exports = {
  'parser': 'babel-eslint',
  'extends': 'airbnb',
  'plugins': [
    'react',
    'jsx-a11y',
    'import'
  ],
  'rules': {
    'quotes': [0],
    'semi': [0],
    'react/prop-types': [0],
    'no-underscore-dangle': [0],
    'no-script-url': [0],
    'max-len': [2, 150],
    'comma-dangle': [2, {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'always-multiline',
      'exports': 'always-multiline',
      'functions': 'ignore',
    }],
    'camelcase': [0],
    'arrow-body-style': [0],
    'indent': [2, 2, {
      'SwitchCase': 1,
    }],
    'quote-props': [2, 'consistent'],
    'no-plusplus': [2, {
      'allowForLoopAfterthoughts': true
    }],
    'no-use-before-define': ["error", {
      "classes": false,
      "variables": false
    }],
    'import/no-extraneous-dependencies': [0],
    'import/no-unresolved': [0],
    'import/extensions': [0],
    'import/prefer-default-export': [0],
    'react/self-closing-comp': [0],
    'react/prefer-stateless-function': [0],
    'react/jsx-filename-extension': [1, {
      'extensions': ['.js', '.jsx']
    }],
    'react/jsx-indent': [2, 2],
    'react/jsx-indent-props': [2, 2],
    'react/jsx-boolean-value': [2, 'always'],
    'global-require': [0]
  },
  'globals': {
    'document': false,
    'window': false,
    'fetch': false,
    /**
     *  jest global variable
     */
    'jest': false,
    'describe': false,
    'it': false,
    'expect': false,
    'beforeEach': false,
    'afterEach': false,
  },
};
