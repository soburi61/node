import requests
from bs4 import BeautifulSoup
import re

def scrape_subjects(school, department, grade):
    url = "https://syllabus.kosen-k.go.jp"
    try:
        res = requests.get(url)
        res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"URL: {url} へのリクエスト中にエラーが発生しました: {e}")
        return []

    school_soup = BeautifulSoup(res.content, "html.parser")

    # kosen名のURLを探す
    school_anchor = school_soup.find("a", string=school)
    if not school_anchor:
        print(f"学校名 '{school}' が見つかりませんでした。")
        return []
    school_url = url + school_anchor.get('href')

    # HTMLを取得
    try:
        res = requests.get(school_url)
        res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"URL: {school_url} へのリクエスト中にエラーが発生しました: {e}")
        return []
    school_soup = BeautifulSoup(res.content, "html.parser")

    # 学科名を含む要素を探す
    department_heading = school_soup.find("h4", string=department)
    if not department_heading:
        print(f"学科名 '{department}' が見つかりませんでした。")
        return []

    # 学科名が見つかった場合、その親要素を取得し、科目一覧のリンクを探す
    parent_div = department_heading.find_parent("div", class_="row")
    if not parent_div:
        print(f"学科名 '{department}' の親要素が見つかりませんでした。")
        return []
    department_anchor = parent_div.find("a", string="本年度の開講科目一覧")
    if not department_anchor:
        print(f"学科名 '{department}' の科目一覧リンクが見つかりませんでした。")
        return []
    department_url = url + department_anchor.get('href')

    try:
        res = requests.get(department_url)
        res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"URL: {department_url} へのリクエスト中にエラーが発生しました: {e}")
        return []
    department_soup = BeautifulSoup(res.content, "html.parser")
    
    # "panel-body" クラスを持つ div をすべて探す
    panel_bodies = department_soup.find_all("div", class_="panel-body")
    # 二つ目の "panel-body" クラスを持つ div を取得
    if len(panel_bodies) < 2:
        print("必要な 'panel-body' 要素が見つかりませんでした。")
        return []

    panel_body = panel_bodies[1]  # 二つ目の要素を取得
    if not panel_body:
        print(f"科目一覧が含まれる要素が見つかりませんでした。")
        return []
    
    subjects_info = []
    #print(panel_body.prettify())
    subjects_soup =panel_body.find_all('tr', {'data-course-value': ''})
    #print(subjects_soup.prettify())
    # 科目ごとの情報を取得してsubjects_infoに格納
    for subject in subjects_soup:
        #print(subject.prettify())
        subject_name = ""
        subject_type = ""
        credit = 0
        teachers = []
        span_element = subject.find("span", class_="mcc-hide")
        if span_element:
            subject_name = span_element.text.strip()
        else:
            continue

        teacher_td = subject.find("td", width="122")
        if teacher_td:
            teachers = [teacher.strip() for teacher in teacher_td.text.split(',')]

        grade_class = "c" + str(grade) + "m"
        grade_elements = subject.find_all("td", class_=grade_class)
        #print(grade_elements)
        temp="None"
        for grade_element in grade_elements:
            if grade_element.text.strip():
                temp=grade_element.text.strip()
        if temp == "None":#gradeのとこのマスに何もなかったらスキップ
            continue


        temp = subject.find("td", class_=re.compile(r'c1|c2'))
        subject_type = temp.find_next_sibling("td").text.strip()+"/"+temp.text.strip()

        # 履修単位または学修単位と書かれているtd要素を探す
        credit_td = subject.find("td", string=re.compile(r'履修単位|学修単位'))
        if credit_td:
            # 見つかったtd要素の次の兄弟要素を取得
            credit_td = credit_td.find_next_sibling("td")
            if credit_td:
                credit = credit_td.text.strip()

        
        subject_info = {
            "subject_name": subject_name,
            "subject_type": subject_type,
            "teachers": teachers,
            "credit": credit
        }
        subjects_info.append(subject_info)

    return subjects_info

# 高専名、学科名、学年を指定して科目一覧を取得
school = "熊本高等専門学校"  
department = "人間情報システム工学科"  
grade = "5" 
subjects = scrape_subjects(school, department, grade)
# 取得した科目一覧を表示
for subject in subjects:
    print(subject)