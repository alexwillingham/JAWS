'use strict';

const path      = require('path'),
    utils     = require('./utils/index'),
    JawsCLI   = require('./utils/cli'),
    JawsError = require('./jaws-error'),
    Promise   = require('bluebird'),
    AWSUtils  = require('./utils/aws');

/**
 * Jaws base Class
 */

class Jaws {

  constructor(config) {

    let _this = this;
    config    = config ? config : {};

    // Add Defaults
    this._interactive       = (config.interactive !== undefined) ? config.interactive : process.stdout.isTTY;
    this._awsAdminKeyId     = config.awsAdminKeyId;
    this._awsAdminSecretKey = config.awsAdminSecretKey;
    this._version           = require('./../package.json').version;
    this._projectRootPath   = utils.findProjectRootPath(process.cwd());
    this._projectJson       = false;
    this._queue             = [];
    this.actions            = {};
    this.hooks              = {};

    // If within project, add further meta data
    if (this._projectRootPath) {

      this._projectJson = require(this._projectRootPath + '/jaws.json');

      // Load Plugins
      this._loadPlugins(this._projectJson.plugins);

      // Load Admin ENV information
      // Don't display dotenv load failures for admin.env if we already have the required environment variables
      let silent = !!process.env.ADMIN_AWS_PROFILE;
      require('dotenv').config({
        silent: silent,
        path:   path.join(this._projectRootPath, 'admin.env'),
      });
      this._profile     = process.env.ADMIN_AWS_PROFILE;
      this._credentials = AWSUtils.profilesGet(this._profile)[this._profile];
    }

    //{
    //  ProjectCreate:       null,
    //  StageCreate:         null,
    //  RegionCreate:        null,
    //  ModuleCreate:        null,
    //  ModulePostInstall:   null,
    //  LambdaPackage:       null,
    //  LambdaUpload:        null,
    //  LambdaProvision:     null,
    //  LambdaDeploy:        null,
    //  ApiGatewayProvision: null,
    //  ResourcesProvision:  null,
    //  EnvList:             null,
    //  EnvGet:              null,
    //  EnvSet:              null,
    //  TagResource:         null,
    //  LambdaRun:           null,
    //  Dash:                null,
    //};

    // Create registry for hooks
      //PreProjectCreate:        [],
      //PostProjectCreate:       [],
      //PreStageCreate:          [],
      //PostStageCreate:         [],
      //PreRegionCreate:         [],
      //PostRegionCreate:        [],
      //PreModuleCreate:         [],
      //PostModuleCreate:        [],
      //PreModulePostInstall:    [],
      //PostModulePostInstall:   [],
      //PreLambdaPackage:        [],
      //PostLambdaPackage:       [],
      //PreLambdaUpload:         [],
      //PostLambdaUpload:        [],
      //PreLambdaProvision:      [],
      //PostLambdaProvision:     [],
      //PreApiGatewayProvision:  [],
      //PostApiGatewayProvision: [],
      //PreResourcesProvision:   [],
      //PostResourcesProvision:  [],
      //PreEnvList:              [],
      //PostEnvList:             [],
      //PreEnvGet:               [],
      //PostEnvGet:              [],
      //PreEnvSet:               [],
      //PostEnvSet:              [],
      //PreTagResource:          [],
      //PostTagResource:         [],
      //PreLambdaRun:            [],
      //PostLambdaRun:           [],
      //PreDash:                 [],
      //PostDash:                [],

    // Load plugins: defaults
    //var defaults = require('./defaults/defaults.json');
    //this._loadPlugins(defaults);

    // Load plugins: project
    if (this._projectRootPath) {
      this._loadPlugins(this._projectJson.plugins);
    }
  }

  /**
   * Update Config
   * @param config
   */

  config(config) {

    // Update JAWS with config properties

    // Load Plugins
    if (config.plugins) {
      this._loadPlugins(config.plugins);
    }
  }

  /**
   * Set Action
   */

  action(actionName, action, config) {

    let _this = this;

    // Add Action
    _this.actions[actionName] = action;

    // Add Action Pre & Post hooks
    _this.hooks['Pre' + actionName]  = [];
    _this.hooks['Post' + actionName] = [];

    // Add Action handler
    if (config && config.handler) {
      _this[config.handler] = this.actions[actionName];
    }

    // Add command

  }

  /**
   * Set Hook
   */

  hook(hookName, hook, index) {

    // Check hook is valid
    if (!this.hooks[hookName]) {

    }

    index = (!index && index !== 0) ? this.hooks[hookName].length : index;
    this.hooks[hookName].splice(index, 0, hook);
  }

  /**
   * Add Plugin
   * @param JawsPlugin class object
   * @returns {Promise}
   */

  addPlugin(JawsPlugin) {
    return Promise.all([
      JawsPlugin.registerActions(),
      JawsPlugin.registerHooks(),
    ]);
  }

  /**
   * Project Create
   * @returns {*}
   */
  //projectCreate(options) {
  //
  //  // Prepare & Execute Queue
  //  this._queue = this._queue.concat(this.hooks.PreProjectCreate);
  //  this._queue.push(this.actions.ProjectCreate.bind({}, options));
  //  this._queue = this._queue.concat(this.hooks.PostProjectCreate);
  //  return this._executeQueue();
  //}

  /**
   * Execute Queue
   */

  _executeQueue() {
    let _this = this;

    return Promise.try(function() {
          return _this._queue;
        })
        .each(function(p) {
          return p;
        })
        .catch(function(error) {
          throw new JawsError(error);
        });
  }

  /**
   * Load Plugins
   */

  _loadPlugins(plugins) {

    for (let i = 0; i < plugins.length; i++) {
      let plugin = plugins[i];

      if (plugin.path) {
        require(plugin.path);
      } else {

      }
    }
  }
}

module.exports = Jaws;