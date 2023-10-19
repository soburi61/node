// タスクの詳細内容をオブジェクトとして保存
var popupDetails = {
    'add-subject-btn': `
                <p class="subject-title">新しい科目</p>
                <form action="/addSubject" method="post">
                <input type="text" name="subject_name" placeholder="科目名">
                <br>
                <label for="subject_type">科目のタイプ</label>
                <span>:</span>
                <input type="text" id="subject_type" name="subject_type">
                <br>
                <label for="subject_location">場所</label>
                <span>:</span>
                <input type="text" id="subject_location" name="subject_location">
                <br>
                <label for="credit">単位数</label>
                <span>:</span>
                <input type="number" id="credit" name="credit">
                <br>
                <label for="grade">対象学年</label>
                <span>:</span>
                <input type="number" id="grade" name="grade">
                <br>
                <label for="absences">欠課</label>
                <span>:</span>
                <input type="number" id="absences" name="absences">
                <br>
                <label for="tardies">遅刻</label>
                <span>:</span>
                <input type="number" id="tardies" name="tardies">
                <br>
                <label for="memo">メモ</label>
                <span>:</span>
                <input type="text" id="memo" name="memo">
                <br>
                <button type="submit" class="btn">追加</button>
                </form>`,
                'edit-subject-btn': `
                <p class="subject-title">応用数学II</p>
                <div>
                    <span>科目のタイプ: </span><span>専門必修</span>
                </div>
                <div>
                    <span>場所: </span><span>教室</span>
                </div>
                <div>
                    <span>単位数: </span><span>2</span>
                </div>
                <div>
                    <span>対象学年: </span><span>5</span>
                </div>
                <div>
                    <span>欠課: </span><span>0</span>
                </div>
                <div>
                    <span>遅刻: </span><span>0</span>
                </div>
                <div>
                    <span>メモ: </span><span></span>
                </div>
                <button class="btn">編集</button>`,            
	'add-task-btn': `
                <p class="task-title">新しいタスク<p>
                <form action="/addTask" method="post">
                <input type="text" name="task" placeholder="タスク名">
                <br>
                <label for="filter">状態</label>
                <span>:</span>
                <select id="filter">
                    <option value="not-started">未実行</option>
                    <option value="in-progress">実行中</option>
                    <option value="completed">実行済み</option>
                </select>
                <br>
                <label for="importance">重要度</label>
                <span>:</span>
                <input type="range" id="importance" name="importance" min="0" max="10">
                <br>
                <label for="lightness">軽さ</label>
                <span>:</span>
                <input type="range" id="lightness" name="lightness" min="0" max="10">
                <br>
                <input type="date" name="deadline">
                <button type="submit">追加</button>
                </form>`,
    'task-item': `
                <p class="task-title">タスク1</p>
                <label for="filter">状態</label>
                <span>:</span>
                <select id="filter">
                    <option value="not-started">未実行</option>
                    <option value="in-progress">実行中</option>
                    <option value="completed">実行済み</option>
                </select>
                <br>
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
};

$(function(){
    var container = $('.modal-container');
    var modalContent = $('.modal-content'); // モーダルのコンテンツ部分

    $('.popup').on('click', function(){
        container.addClass('active'); // モーダルを表示
        // クラス名で条件分岐
        if ($(this).hasClass('add-subject-btn')) {
            modalContent.html(popupDetails['add-subject-btn']);
        } else if ($(this).hasClass('edit-subject-btn')) {
            modalContent.html(popupDetails['edit-subject-btn']);
        } else if ($(this).hasClass('add-task-btn')) {
            modalContent.html(popupDetails['add-task-btn']);
        } else if ($(this).hasClass('task-item')) {
            modalContent.html(popupDetails['task-item']);
        } else if ($(this).hasClass('add-timetable')) {
            $.getJSON('/getSubjects', function(subjects) {
                let subjectListHtml = '<p class="subject-title">科目を追加</p><ul class="subject-list">';
                subjects.forEach((subject) => {
                    subjectListHtml += `<li><button class="select-subject" data-subject-id="${subject.subject_id}">${subject.subject_name}</button></li>`;
                });
                subjectListHtml += '</ul>';
                modalContent.html(subjectListHtml);
        
                // 科目が選択されたときに発火するイベント
                $('.select-subject').on('click', function() {
                    const subjectId = $(this).data('subject-id');  // 選択された科目のID
                    // <td>タグにdata-dayとdata-timeがセットされていると仮定
                    const day = $(this).closest('td').data('day');  // 曜日
                    const time = $(this).closest('td').data('time');  // 時間

                    // このデータをサーバーに送る
                    $.post('/setClass', {subjectId, day, time}, function(response) {
                        // 成功した場合の処理
                        if (response.success) {
                            console.log('科目が追加されました');
                            
                        }
                    })
                    .fail(function() {
                        console.log('科目の追加に失敗しました');
                    });
                });
            })
            .fail(function() {
                console.log("科目一覧の取得に失敗しました");
            });
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