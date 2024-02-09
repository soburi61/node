
$('body').on('click', '.add-class-btn', function() {
  const cell = $(this).parent(); // クリックされたセル（td）を取得

  // サーバーから科目一覧を取得
  $.getJSON('/getSubjects', function(subjects) {
    const subjectListHtml = subjects.reduce((html, subject) => {
      return html + `<option value="${subject.subject_id}">${subject.subject_name}</option>`;
    }, '<select class="subject-dropdown"><option>科目を選択</option>');
    cell.html(subjectListHtml + '</select'); // プルダウンメニューをセルに追加
  });
});

// プルダウンメニューが選択されたら
$('body').on('change', '.subject-dropdown', function() {
  const selectedSubjectId = $(this).val();
  const week = $(this).closest('.subject').data('week'); // 曜日を取得
  const time = $(this).closest('.subject').data('time'); // 曜日を取得
  // 選択された科目を時間割に追加するAPIを呼び出す
  $.post('/setClass', {subject_id: selectedSubjectId, day_of_week: week, time_slot: time}, function(response) {
    // 成功した場合の処理
    if (response.success) {
      console.log('Subject added');
      location.reload(); // ページをリロード
    } else {
      console.log('Failed to add subject');
    }
  })
  .fail(function() {
    console.log('Failed to add subject');
  });
});

$('body').on('click', '.remove-class-btn', function() {
  const week = $(this).closest('.subject').data('week'); // 曜日を取得
  const time = $(this).closest('.subject').data('time'); // 時間を取得
  // 科目を時間割から削除するAPIを呼び出す
  $.post('/removeClass', {day_of_week: week, time_slot: time}, function(response) {
    // 成功した場合の処理
    if (response.success) {
      console.log('Subject removed');
      location.reload(); // ページをリロード
    } else {
      console.log('Failed to remove subject');
    }
  })
  .fail(function() {
    console.log('Failed to remove subject');
  });
});
