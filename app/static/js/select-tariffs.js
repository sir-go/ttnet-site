$(function () {
  var views = $('.tg-view');
  views.hide();
  // $('#tgViewTih').show();

  var ctSelect = $('#ctSelect');
  ctSelect.show();

  ctSelect.selectmenu({
    width: "100%",
    change: function () {
      var viewId = '#tgView' + this.value;
      views.hide();
      $(viewId).show();
    }
  });

});
