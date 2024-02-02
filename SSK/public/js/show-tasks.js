function updateTasks(boxId, sort) {
    $.ajax({
      url: `/getTasks?sort=${sort}`,
      type: 'GET',
      success: function(tasks) {
        const taskList = tasks.map(task => 
          `<div class="task-item">${task.name}</div>` // 例
        ).join('');
        $(`#${boxId} .task-list`).html(taskList);
        console.log(taskList);
      },
      error: function(error) {
        console.error('Error:', error);
      }
    });
  }

  $('.sort').on('change', function() {
    const boxId = $(this).closest('.label-select-container').attr('id');
    const sort = $(`#${boxId} .sort`).val();
    updateTasks(boxId, sort);
  });