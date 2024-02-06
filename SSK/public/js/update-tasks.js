// 最初の表示時にupdateTasksを実行
$(document).ready(function() {
  updateAllTasks();
});

function updateAllTasks(){
  for (let i = 1; i <= 5; i++) {
    const sort = $(`.tasks-container[box-index="${i}"] .sort`).val()
    const category = $(`.tasks-container[box-index="${i}"] .categories`).val()
    updateTasks(i, sort, category);
  }
}

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
$('.sort, .categories').on('change', function() {
  const boxId = $(this).closest('.tasks-container').attr('box-index');
  const sort = $(this).closest('.tasks-container').find('.sort').val();
  const category = $(this).closest('.tasks-container').find('.categories').val();
  updateTasks(boxId, sort, category);
});
// チェックボックスがクリックされたときのイベントハンドラを追加
$(document).on('change', '.task-checkbox', function() {
  const taskId = $(this).closest('.task-item').data('task-id');
  $.ajax({
    url: `/updateTasks`,
    type: 'POST',
    data: { id: taskId, status: 'inactive' },
    success: function(response) {
      updateAllTasks();
      console.log(response);
    },
    error: function(error) {
      console.error('Error:', error);
    }
  });
});