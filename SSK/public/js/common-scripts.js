document.addEventListener('click', async function(event) {
    if (event.target.matches('.syllabus')) {
      event.preventDefault(); // デフォルトのリンク先への遷移をキャンセル
      const response = await fetch('/getSyllabusUrl'); // シラバスのURLを取得
      const data = await response.json();
      const syllabusUrl = data.syllabusUrl;
      window.open(syllabusUrl, '_blank'); // シラバスのURLを新しいタブで開く
    }
  });

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