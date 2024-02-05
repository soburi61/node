// 最初の表示時にupdateTasksを実行
$(document).ready(function() {
  for (let i = 1; i <= 5; i++) {
    updateTasks(i, $(`.tasks-container[box-index="${i}"] .sort`).val(), 0);
  }
});

function updateTasks(boxId, sort, category) {
  $.ajax({
    url: `/getTasks?sort=${sort}&category=${category}`,
    type: 'GET',
    success: function(tasks) {
      let taskList = tasks.map(task => {
        let displayValue = '未設定';
        if (task[sort] !== null) {
          displayValue = sort === 'deadline' ? new Date(task[sort]).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }) : Math.round(task[sort]);
        }
        return `
        <div class="task-item" task-id="${task.id}">
          <div class="left-contents">
            <input type="checkbox" class="task-checkbox" data-task-id="${task.id}">
            <span>${task.name}</span>
          </div>
            <span> ${displayValue}</span>
        </div>`;
      }).join('');
      taskList+=`
      <a href="/newTask" class="btn">
        タスク追加
      </a>`
      $(`.tasks-container[box-index="${boxId}"] .task-list`).empty().html(taskList);
    },
    error: function(error) {
      console.error('Error:', error);
    }
  });
}
$('.sort').on('change', function() {
  const boxId = $(this).closest('.tasks-container').attr('box-index');
  const sort = $(this).val();
  const category = $(this).closest('.tasks-container').find('.categories').val();
  //console.log(`boxId${boxId}`);
  //console.log(`sort${sort}`);
  //console.log(`category${category}`);
  updateTasks(boxId, sort, category);
});
$('.sort, .categories').on('change', function() {
  const boxId = $(this).closest('.tasks-container').attr('box-index');
  const sort = $(this).closest('.tasks-container').find('.sort').val();
  const category = $(this).val();
  updateTasks(boxId, sort, category);
});
// チェックボックスがクリックされたときのイベントハンドラを追加
$(document).on('change', '.task-checkbox', function() {
  const taskId = $(this).closest('.task-item').data('task-id');
  $.ajax({
    url: `/updateTaskStatus`,
    type: 'POST',
    data: { id: taskId, status: 'inactive' },
    success: function(response) {
      console.log(response);
    },
    error: function(error) {
      console.error('Error:', error);
    }
  });
});