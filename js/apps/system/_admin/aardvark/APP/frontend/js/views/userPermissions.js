/* jshint browser: true */
/* jshint unused: false */
/* global arangoHelper, _, Backbone, window, templateEngine, $ */

(function () {
  'use strict';

  window.UserPermissionView = Backbone.View.extend({
    el: '#content',

    template: templateEngine.createTemplate('userPermissionView.ejs'),

    initialize: function (options) {
      this.username = options.username;
    },

    remove: function () {
      this.$el.empty().off(); /* off to unbind the events */
      this.stopListening();
      this.unbind();
      delete this.el;
      return this;
    },

    events: {
      'click #userPermissionView .dbCheckbox': 'setDBPermission',
      'click #userPermissionView .collCheckbox': 'setCollPermission',
      'click .db-row': 'toggleAccordion'
    },

    render: function (open) {
      var self = this;

      this.collection.fetch({
        success: function () {
          self.continueRender(open);
        }
      });
    },

    toggleAccordion: function (e) {
      // if checkbox was hit
      if ($(e.target).attr('type')) {
        return;
      }
      if ($(e.target).parent().hasClass('noAction')) {
        return;
      }
      if ($(e.target).hasClass('inner') || $(e.target).is('span')) {
        return;
      }
      var visible = $(e.currentTarget).find('.collection-row').is(':visible');

      var db = $(e.currentTarget).attr('id').split('-')[0];
      $('.collection-row').hide();

      // unhighlight db labels
      $('.db-label').css('font-weight', 200);
      $('.db-label').css('color', '#8a969f');

      // if collections are available
      if ($(e.currentTarget).find('.collection-row').children().length > 4) {
        // if menu was already visible -> then hide
        $('.db-row .fa-caret-down').hide();
        $('.db-row .fa-caret-right').show();
        if (visible) {
          $(e.currentTarget).find('.collection-row').hide();
        } else {
          // else show menu
          $(e.currentTarget).find('.collection-row').fadeIn('fast');
          // highlight db label
          $(e.currentTarget).find('.db-label').css('font-weight', 600);
          $(e.currentTarget).find('.db-label').css('color', 'rgba(64, 74, 83, 1)');
          // caret animation
          $(e.currentTarget).find('.fa-caret-down').show();
          $(e.currentTarget).find('.fa-caret-right').hide();
        }
      } else {
        // caret animation
        $('.db-row .fa-caret-down').hide();
        $('.db-row .fa-caret-right').show();
        arangoHelper.arangoNotification('Permissions', 'No collections in "' + db + '" available.');
      }
    },

    setCollPermission: function (e) {
      var db = $(e.currentTarget).attr('db');
      var collection = $(e.currentTarget).attr('collection');
      var value;

      if (db === '_DEFAULT_') {
        db = '*';
      }
      if (collection === '_DEFAULT_') {
        collection = '*';
      }

      if ($(e.currentTarget).hasClass('readOnly')) {
        value = 'ro';
      } else if ($(e.currentTarget).hasClass('readWrite')) {
        value = 'rw';
      } else {
        value = 'none';
      }
      this.sendCollPermission(this.currentUser.get('user'), db, collection, value);
    },

    setDBPermission: function (e) {
      var db = $(e.currentTarget).attr('name');

      if (db === '_DEFAULT_') {
        db = '*';
      }

      var value;
      if ($(e.currentTarget).hasClass('readOnly')) {
        value = 'ro';
      } else if ($(e.currentTarget).hasClass('readWrite')) {
        value = 'rw';
      } else {
        value = 'none';
      }

      if (db === '_system' && value === 'none' || db === '_system' && value === 'ro') {
        // special case, ask if user really want to revoke persmission here
        var buttons = []; var tableContent = [];

        tableContent.push(
          window.modalView.createReadOnlyEntry(
            'db-system-revoke-button',
            'Caution',
            'You are changing your permissions to _system database. Really continue?',
            undefined,
            undefined,
            false
          )
        );
        buttons.push(
          window.modalView.createSuccessButton('Revoke', this.sendDBPermission.bind(this, this.currentUser.get('user'), db, value))
        );
        buttons.push(
          window.modalView.createCloseButton('Cancel', this.rollbackInputButton.bind(this, db))
        );
        window.modalView.show('modalTable.ejs', 'Revoke _system Database Permission', buttons, tableContent);
      } else {
        this.sendDBPermission(this.currentUser.get('user'), db, value);
      }
    },

    rollbackInputButton: function (name) {
      var open;
      _.each($('.collection-row'), function (elem, key) {
        if ($(elem).is(':visible')) {
          open = $(elem).parent().attr('id');
        }
      });

      if (open) {
        this.render(open);
      } else {
        this.render();
      }
    },

    sendCollPermission: function (user, db, collection, value) {
      var self = this;

      if (value === 'none') {
        this.revokeCollPermission(user, db, collection);
      } else {
        $.ajax({
          type: 'PUT',
          url: arangoHelper.databaseUrl('/_api/user/' + encodeURIComponent(user) + '/database/' + encodeURIComponent(db) + '/' + encodeURIComponent(collection)),
          contentType: 'application/json',
          data: JSON.stringify({
            grant: value
          })
        }).error(function (e) {
          self.rollbackInputButton();
        });
      }
    },

    revokeCollPermission: function (user, db, collection) {
      var self = this;

      $.ajax({
        type: 'DELETE',
        url: arangoHelper.databaseUrl('/_api/user/' + encodeURIComponent(user) + '/database/' + encodeURIComponent(db) + '/' + encodeURIComponent(collection)),
        contentType: 'application/json'
      }).error(function (e) {
        self.rollbackInputButton();
      });
    },

    sendDBPermission: function (user, db, value) {
      var self = this;

      if (value === 'none') {
        this.revokeDBPermission(user, db);
      } else {
        $.ajax({
          type: 'PUT',
          url: arangoHelper.databaseUrl('/_api/user/' + encodeURIComponent(user) + '/database/' + encodeURIComponent(db)),
          contentType: 'application/json',
          data: JSON.stringify({
            grant: value
          })
        }).error(function (e) {
          self.rollbackInputButton();
        });
      }
    },

    revokeDBPermission: function (user, db) {
      var self = this;

      $.ajax({
        type: 'DELETE',
        url: arangoHelper.databaseUrl('/_api/user/' + encodeURIComponent(user) + '/database/' + encodeURIComponent(db)),
        contentType: 'application/json'
      }).error(function (e) {
        self.rollbackInputButton();
      });
    },

    continueRender: function (open) {
      var self = this;

      this.currentUser = this.collection.findWhere({
        user: this.username
      });
      this.breadcrumb();

      var url = arangoHelper.databaseUrl('/_api/user/' + encodeURIComponent(self.currentUser.get('user')) + '/database?full=true');
      /*
      if (frontendConfig.db === '_system') {
        url = arangoHelper.databaseUrl('/_api/user/root/database');
      }
      */

      // FETCH COMPLETE DB LIST
      $.ajax({
        type: 'GET',
        url: url,
        contentType: 'application/json',
        success: function (data) {
          // fetching available dbs and permissions
          self.finishRender(data.result, open);
        },
        error: function (data) {
          arangoHelper.arangoError('User', 'Could not fetch user permissions');
        }
      });
    },

    finishRender: function (permissions, open) {
      $(this.el).html(this.template.render({
        permissions: permissions
      }));
      $('.pure-table-body').height(window.innerHeight - 200);
      if (open) {
        $('#' + open).click();
      }
    },

    breadcrumb: function () {
      var self = this;

      if (window.App.naviView) {
        $('#subNavigationBar .breadcrumb').html(
          'User: ' + this.currentUser.get('user')
        );
        arangoHelper.buildUserSubNav(self.currentUser.get('user'), 'Permissions');
      } else {
        window.setTimeout(function () {
          self.breadcrumb();
        }, 100);
      }
    }

  });
}());
