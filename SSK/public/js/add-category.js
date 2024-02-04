$(document).ready(function() {
  fetchUpdatedCategories();
});

// 新しいカテゴリを追加するフォームの送信イベントを監視
// 追加ボタンがクリックされたときの処理
$('#addCategoryBtn').click(function() {
  const newCategory = $('#newCategory').val(); // 新しいカテゴリ名を取得

  // 新しいカテゴリを追加するAjaxリクエスト
  $.ajax({
    type: 'POST',
    url: '/addCategory',
    contentType: 'application/json',
    data: JSON.stringify({ newCategory: newCategory }),
    success: function(data) {
      fetchUpdatedCategories(); // カテゴリメニューを動的に更新
    },
    error: function(error) {
      console.error('Error:', error);
    }
  });
});
  
  // カテゴリメニューを動的に更新する関数
  function fetchUpdatedCategories() {
    $.get('/getCategories', function(response) {
      const categories = response.categories; // カテゴリ配列を取得
      const categorySelect = $('#category');
      categorySelect.empty(); // カテゴリメニューをクリア
      $.each(categories, function(index, category) {
        categorySelect.append($('<option>', {
          value: category.category_id,
          text: category.category_name
        })); // 新しいオプションを追加
      });
    })
    .fail(function(error) {
      console.error('Error:', error);
    });
  }
  $('#addCategoryBtn').click(function() {
    $('#addCategoryForm').submit(); // addCategoryFormを送信
  });