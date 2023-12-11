import requests
from bs4 import BeautifulSoup
import re
import json
import sys
def scrape_subjects(kosen, department, grade):
    url = "https://syllabus.kosen-k.go.jp"
    try:
        res = requests.get(url)
        res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"URL: {url} へのリクエスト中にエラーが発生しました: {e}")
        return []

    kosen_soup = BeautifulSoup(res.content, "html.parser")

    # kosen名のURLを探す
    kosen_anchor = kosen_soup.find("a", string=kosen)
    if not kosen_anchor:
        print(f"学校名 '{kosen}' が見つかりませんでした。")
        return []
    kosen_url = url + kosen_anchor.get('href')

    # HTMLを取得
    try:
        res = requests.get(kosen_url)
        res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"URL: {kosen_url} へのリクエスト中にエラーが発生しました: {e}")
        return []
    kosen_soup = BeautifulSoup(res.content, "html.parser")

    # 学科名を含む要素を探す
    department_heading = kosen_soup.find("h4", string=department)
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

        teacher = subject.find("td", width="122").text.strip()

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
            "teacher": teacher,
            "credit": credit
        }
        subjects_info.append(subject_info)

    return subjects_info

if __name__ == "__main__":
    # コマンドライン引数を取得
    args = sys.argv[1:]  # 最初の引数はファイル名なので除外

    # 引数が3つであることを確認
    if len(args) != 3:
        print("引数は3つ必要です: 学校名 学科名 学年")
        sys.exit(1)

    kosen, department, grade = args
    subjects = scrape_subjects(kosen, department, grade)
    print(json.dumps(subjects))