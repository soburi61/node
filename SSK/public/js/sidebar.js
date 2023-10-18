document.addEventListener("DOMContentLoaded", function() {
    const sidebar = document.getElementById("sidebar");
    const toggleSidebarBtn = document.getElementById("toggle-sidebar");
  
    toggleSidebarBtn.addEventListener("click", function() {
      sidebar.classList.toggle('open');
      if (sidebar.classList.contains('open')) {
        // サイドバーが開いたときのアイコン
        toggleSidebarBtn.classList.remove('fa-bars');
        toggleSidebarBtn.classList.add('fa-angles-left');
      } else {
        // サイドバーが閉じたときのアイコン
        toggleSidebarBtn.classList.remove('fa-angles-left');
        toggleSidebarBtn.classList.add('fa-bars');
      }
    });
    
  });