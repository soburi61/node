// 最初の表示時にupdateTasksを実行
$(document).ready(function() {
  updateTasks(1, 'priority'); // updateTasksを実行
  updateTasks(2, 'priority');
  updateTasks(3, 'priority');
  updateTasks(4, 'priority');
  updateTasks(5, 'priority');
});

function updateTasks(boxId, sort) {
  $.ajax({
    url: `/getTasks?sort=${sort}`,
    type: 'GET',
    success: function(tasks) {
      const taskList = tasks.map(task => {
        let displayValue = '未設定';
        if (task[sort] !== null) {
          displayValue = sort === 'deadline' ? new Date(task[sort]).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }) : task[sort];
        }
        displayValue = Number.isInteger(displayValue) ? displayValue : Math.round(displayValue);
        return `
        <div class="task-item" id="edit-task" task-id="${task.id}">
            <input type="checkbox" class="task-checkbox" data-task-id="${task.id}">
          <p>${task.name} ${displayValue}</p>
        </div>`;
      }).join('');
      $(`.task-list[data-list-index="${boxId}"]`).empty().html(taskList);
      console.log(boxId);
    },
    error: function(error) {
      console.error('Error:', error);
    }
  });
}
$('.sort').on('change', function() {
  const boxId = $(this).closest('.label-select-container').data('list-index');
  const sort = $(this).val();
  updateTasks(boxId, sort);
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