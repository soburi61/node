if (typeof currentCategoryId === 'undefined') {
  var currentCategoryId = '0'; // ここにデフォルトの値を設定
}

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
      $('#newCategory').val(''); // フィールドを初期化
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
      const categorySelect = $('.categories');
      
      categorySelect.empty().append($(`<option value="0"> None </option>`));
      $.each(categories, function(index, category) {
        const option = $('<option>', {
          value: category.category_id,
          text: category.category_name
        }); // 新しいオプションを追加
  
        // カテゴリが現在のタスクのカテゴリと一致する場合、そのオプションを選択状態にする
        if (category.category_id == currentCategoryId) {
          option.prop('selected', true);
        }
  
        categorySelect.append(option);
      });
    })
    .fail(function(error) {
      console.error('Error:', error);
    });
  }