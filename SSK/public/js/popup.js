$(document).ready(function() {
    // タスクアイテムがクリックされた場合
    // 画像をクリックでポップアップを表示
    // 画像をクリックでポップアップを表示
    $('.buttonTravel').click(function(){
        $('.popTravel').fadeIn();
    });
  
    $(document).on('click touchend', function(event) {
        // 表示したポップアップ以外の部分をクリックしたとき
        if (!$(event.target).closest('.buttonTravel').length) {
          $('.popTravel').fadeOut();
        }
    });
});
  