$(document).ready(function() {
    // add-class ボタンがクリックされたら
    $('body').on('click', '.add-class', function() {
      const cell = $(this).parent(); // クリックされたセル（td）を取得
      const day = cell.data('day'); // 曜日を取得
      const time = cell.data('time'); // 時間を取得
  
      // サーバーから科目一覧を取得
      $.getJSON('/getSubjects', function(subjects) {
        let subjectListHtml = '<select class="subject-dropdown">';
        subjectListHtml += '<option>科目を選択</option>'
        subjects.forEach((subject) => {
          subjectListHtml += `<option value="${subject.subject_id}">${subject.subject_name}</option>`;
        });
        subjectListHtml += '</select>';
  
        // プルダウンメニューをセルに追加
        cell.html(subjectListHtml);
  
        // プルダウンメニューが選択されたら
        $('.subject-dropdown').on('change', function() {
          const selectedSubjectId = $(this).val(); // 選択された科目のID
  
          // 選択された科目を時間割に追加するAPIを呼び出す
          $.post('/setClass', {subject_id: selectedSubjectId, day_of_week: day, time_slot: time}, function(response) {
            // 成功した場合の処理
            if (response.success) {
              console.log('科目が追加されました');
              location.reload(); // ページをリロード
            } else {
              console.log('科目の追加に失敗しました');
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
    });
  });
  