/**
* @package shorty-tracking an ownCloud url shortener plugin addition
* @category internet
* @author Christian Reiner
* @copyright 2012-2012 Christian Reiner <foss@christian-reiner.info>
* @license GNU Affero General Public license (AGPL)
* @link information
* @link repository https://svn.christian-reiner.info/svn/app/oc/shorty-tracking
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
* License as published by the Free Software Foundation; either
* version 3 of the license, or any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU AFFERO GENERAL PUBLIC LICENSE for more details.
*
* You should have received a copy of the GNU Affero General Public
* License along with this library.
* If not, see <http://www.gnu.org/licenses/>.
*
*/

/**
 * @file js/tracking.js
 * @brief Client side initialization of desktop actions
 * @author Christian Reiner
 */

$(document).ready(function(){
  // load layout of dialog to show the list of tracked clicks
  Shorty.Tracking.init();
}); // document.ready

Shorty.Tracking=
{
  // ===== Shorty.Tracking.append =====
  append: function(row,set,hidden){
    // set row id to entry id
    row.attr('id',set.id);
    // handle all aspects, one by one
    $.each(['status','time','address','host','user','result'],
           function(j,aspect){
      if (hidden)
        row.addClass('shorty-fresh'); // might lead to a pulsate effect later
      // we wrap the cells content into a span tag
      var span=$('<span>');
      // enhance row with real set values
      if ('undefined'==set[aspect])
           row.attr('data-'+this,'');
      else row.attr('data-'+this,set[aspect]);
      // fill data into corresponsing column
      var title, content, classes=[];
      switch(aspect){
        case 'status':
          var icon;
          switch (set['result']){
            case 'blocked': icon='bad';
            case 'denied':  icon='neutral';
            case 'granted': icon='good';
            default:        icon='blank';
          } // switch
          span.html('<img class="shorty-icon" width="16" src="'+OC.filePath('shorty','img/status',icon+'.png')+'">');
          break;
        case 'time':
          if (null==set[aspect])
               span.text('-?-');
          else span.text(set[aspect]);
          break;
        default:
          span.text(set[aspect]);
          span.addClass('ellipsis');
      } // switch
      row.find('td#'+aspect).empty().append(span);
    }) // each aspect
  }, // Shorty.Tracking.append
  // ===== Shorty.Tracking.build =====
  build: function(){
    if (Shorty.Debug) Shorty.Debug.log("building tracking list");
    var dfd = new $.Deferred();
    // prepare loading
    $.when(
      Shorty.WUI.List.dim(Shorty.Tracking.list(),false)
    ).done(function(){
      // retrieve new entries
      Shorty.WUI.List.empty(Shorty.Tracking.list());
      $.when(
        Shorty.Tracking.get(Shorty.Tracking.id)
      ).done(function(response){
        $.when(
          Shorty.WUI.List.add(Shorty.Tracking.list(),response.data,Shorty.Tracking.append,false)
        ).done(function(){
          Shorty.WUI.List.dim(Shorty.Tracking.list(),true);
          dfd.resolve();
        }).fail(function(){
          dfd.reject();
        })
      }).fail(function(){
        dfd.reject();
      })
    })
    return dfd.promise();
  }, // Shorty.Tracking.build
  // ===== Shorty.Tracking.control =====
  control:function(entry){
    if (Shorty.Debug) Shorty.Debug.log("tracking list controller");
    var dfd=new $.Deferred();
    var dialog=$('#controls #shorty-tracking-list-dialog');
    Shorty.Tracking.id=entry.attr('id');
    $.when(
      Shorty.WUI.List.empty(dialog)
    ).done(function(){
      Shorty.WUI.Dialog.show(dialog)
      dfd.resolve();
    }).fail(function(){
      dfd.reject();
    })
    // load first content into the list
    Shorty.Tracking.build(Shorty.Tracking.id);
    return dfd.promise();
  }, // Shorty.Tracking.control
  // ===== Shorty.Tracking.dialog =====
  dialog:{},
  // ===== Shorty.Tracking.get =====
  get:function(shorty,offset){
    if (Shorty.Debug) Shorty.Debug.log("loading clicks into tracking list");
    // no offset specified ? then start at the beginning
    offset = offset || 0;
    var dfd=new $.Deferred();
    // retrieve list template
//     var data={shorty:shorty,offset:offset};
    var data={shorty:shorty}
    $.ajax({
      type:     'GET',
      url:      OC.filePath('shorty-tracking','ajax','get.php'),
      cache:    false,
      data:     data,
      dataType: 'json'
    }).pipe(
      function(response){return Shorty.Ajax.eval(response)},
      function(response){return Shorty.Ajax.fail(response)}
    ).done(function(response){
      dfd.resolve(response);
    }).fail(function(response){
      dfd.reject(response);
    })
    return dfd.promise();
  }, // Shorty.Tracking.get
  // ===== Shorty.Tracking.id =====
  id:{},
  // ===== Shorty.Tracking.init =====
  init:function(){
    if (Shorty.Debug) Shorty.Debug.log("initializing tracking list");
    var dfd=new $.Deferred();
    // does the dialog holding the list exist already ?
    if (!$.isEmptyObject(Shorty.Tracking.dialog)){
      // remove all (real) entries so that the table can be filled again
      $('#shorty-tracking-list-dialog #list tr:not(#)').remove();
      dfd.resolve();
    }else{
      // load dialog layout via ajax and create a freshly populated dialog
      $.ajax({
        type:     'GET',
        url:      OC.filePath('shorty-tracking','ajax','layout.php'),
        cache:    false,
        dataType: 'json'
      }).pipe(
        function(response){return Shorty.Ajax.eval(response)},
        function(response){return Shorty.Ajax.fail(response)}
      ).done(function(response){
        // create a fresh dialog and insert it alongside theesting dialogs in the top controls bar
        $('#controls').append(response.layout);
        // keep that new dialog for alter usage and control
        Shorty.Tracking.dialog=$('#controls #shorty-tracking-list-dialog');
        // bind actions to basic buttons
        Shorty.Tracking.dialog.find('#close').bind('click',function(){Shorty.WUI.Dialog.hide(Shorty.Tracking.dialog);});
        Shorty.Tracking.dialog.find('#list #titlebar').bind('click',function(){Shorty.WUI.List.Toolbar.toggle(Shorty.Tracking.list());});
        Shorty.Tracking.dialog.find('#list #toolbar').find('#reload').bind('click',Shorty.Tracking.build);
//         Shorty.Tracking.dialog.find('#list #toolbar').find('shorty-sorter').bind('click',Shorty.WUI.List.sort);
        dfd.resolve(response);
      }).fail(function(response){
        dfd.reject(response);
      })
    } // else
    return dfd.promise();
  },
  // ===== Shorty.Tracking.list =====
  list:function(){
    return Shorty.Tracking.dialog.find('#list').eq(0);
  } // Shorty.Tracking.list
} // Shorty.Tracking
