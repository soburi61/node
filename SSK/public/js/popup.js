// タスクの詳細内容をオブジェクトとして保存
var popupDetails = {
    'add-subject-btn': '',
    'edit-subject-btn': '',
	'add-task-btn': '',
    'task-item': `<p class="task-title">タスク1</p>
                  <label for="importance">重要度</label>
                  <span>:</span>
                  <input type="range" id="importance" name="importance" min="0" max="10">
                  <br>
                  <label for="lightness">軽さ</label>
                  <span>:</span>
                  <input type="range" id="lightness" name="lightness" min="0" max="10">
                  <br>
                  <label>締め切り</label>
                  <span>:</span>
                  <span class="detail">2023-11-12 11:59 PM</span>
                  <input type="date" name="deadline">
                  <hr>
                  <p>タスクの詳細</p>`
    // 他のタスクも追加可能
};

$(function(){
    var container = $('.modal-container');
    var modalContent = $('.modal-content'); // モーダルのコンテンツ部分

    $('.popup').on('click', function(){
        container.addClass('active'); // モーダルを表示

        // クラス名で条件分岐
        if ($(this).hasClass('add-subject-btn')) {
            modalContent.html(popupDetails['add-subject-btn']); // edit-taskの内容をセット
        } else if ($(this).hasClass('edit-subject-btn')) {
            modalContent.html(popupDetails['edit-subject-btn']); // new-taskの内容をセット
        } else if ($(this).hasClass('add-task-btn')) {
            modalContent.html(popupDetails['add-task-btn']); // new-taskの内容をセット
        } else if ($(this).hasClass('task-item')) {
            modalContent.html(popupDetails['task-item']); // new-taskの内容をセット
        } 
        // ... 他のクラス名に対する処理もここに追加 ...

        return false; // イベントの伝播を防ぐ
    });

    // 閉じるボタンをクリックしたらモーダルを閉じる
    $('.modal-close').on('click', function(){
        container.removeClass('active');
    });

    // モーダルの外側をクリックしたらモーダルを閉じる
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.modal-body').length) {
            container.removeClass('active');
        }
    });
});
