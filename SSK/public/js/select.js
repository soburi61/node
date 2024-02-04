document.addEventListener('DOMContentLoaded', function() {
  const kosenSelect = document.getElementById('kosen');
  const departmentSelect = document.getElementById('department');

  kosenSelect.addEventListener('change', function() {
    const kosen = this.value;
    // 既存のオプションをクリア
    departmentSelect.innerHTML = '<option value="">選択してください</option>';
    fetch(`/getDepartments?kosen=${encodeURIComponent(kosen)}`)
      .then(response => response.json())
      .then(departments => {
        departments.forEach(department => {
          const option = document.createElement('option');
          option.value = department;
          option.textContent = department;
          departmentSelect.appendChild(option);
        });
      })
      .catch(error => {
        console.error('Error fetching departments:', error);
      });
  });
});