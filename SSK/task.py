import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import matplotlib.pyplot as plt
import datetime
import os

tasks = []
debag = True

#--定義--
# 重要度、締切日（日付）、タスクの軽さを入力変数とします
importance = ctrl.Antecedent(np.arange(0, 11, 1), 'importance')
lightness = ctrl.Antecedent(np.arange(0, 11, 1), 'lightness')
deadline = ctrl.Antecedent(np.arange(0, 61, 1), 'deadline')


# 優先度を出力変数とします
priority = ctrl.Consequent(np.arange(0, 101, 1), 'priority')

# 各変数のファジィ集合を定義します
importance['low'] = fuzz.trimf(importance.universe, [0, 0, 5])
importance['medium'] = fuzz.trimf(importance.universe, [0, 5, 10])
importance['high'] = fuzz.trimf(importance.universe, [5, 10, 10])

lightness['light'] = fuzz.trimf(lightness.universe, [0, 0, 5])
lightness['medium'] = fuzz.trimf(lightness.universe, [0, 5, 10])
lightness['heavy'] = fuzz.trimf(lightness.universe, [5, 10, 10])

deadline['near'] = fuzz.trimf(deadline.universe, [0, 0, 15])
deadline['medium'] = fuzz.trimf(deadline.universe, [10, 30, 50])
deadline['far'] = fuzz.trimf(deadline.universe, [30, 60, 60])

priority['low'] = fuzz.trimf(priority.universe, [0, 0, 50])
priority['medium'] = fuzz.trimf(priority.universe, [0, 50, 100])
priority['high'] = fuzz.trimf(priority.universe, [50, 100, 100])
if debag:
    importance.view()
    plt.show()
    lightness.view()
    plt.show()
    deadline.view()
    plt.show()

# ルールを定義
rule1 = ctrl.Rule(importance['low'] | deadline['far'] | lightness['light'], priority['low'])
rule2 = ctrl.Rule(importance['medium'] | deadline['medium'] | lightness['medium'], priority['medium'])
rule3 = ctrl.Rule(importance['high'] | deadline['near'] | lightness['heavy'], priority['high'])
rule4 = ctrl.Rule(deadline['near'] & lightness['heavy'], priority['high'])
# ルールを制御システムに追加
priority_ctrl = ctrl.ControlSystem([rule1, rule2, rule3])
#------



def calculate_priority(name, importance_value, lightness_value, deadline_date):


    # 制御システムをシミュレーションに接続します
    priority_eval = ctrl.ControlSystemSimulation(priority_ctrl)

    # 具体的な入力値を設定します
    priority_eval.input['importance'] = importance_value
    priority_eval.input['lightness'] = lightness_value
    # 締切日を日付または時間形式から数値に変換し、適切な値を設定します
    current_date = datetime.datetime.now()  # 現在の日付を取得
    days_until_deadline = (deadline_date - current_date).days
    # 2ヶ月以内の場合はスケーリング
    if days_until_deadline >= 60:
        days_until_deadline = 60  # 2ヶ月以上は60に設定
    priority_eval.input['deadline'] = days_until_deadline
    
    # 優先度を計算します
    priority_eval.compute()
    
    if debag:
        priority.view(sim=priority_eval)
        # グラフにタイトルを追加
        plt.title(f"{name}({priority_eval.output['priority']})")
        # グラフを表示
        plt.show()
        

    # 優先度を返します
    return priority_eval.output['priority']


# タスクを優先度順に並び替える関数を定義します
def sort_tasks(task_list):
    # ラムダでソートを定義
    task_list.sort(key=lambda x: calculate_priority(x["name"], x["importance"], x["lightness"],x["deadline_date"]), reverse=True)
    return task_list

# ファイル名を指定します
task_file = "tasks.txt"

# ファイルが存在する場合、タスクを読み込みます
if os.path.exists(task_file):
    with open(task_file, "r" ,encoding='utf-8') as file:
        lines = file.readlines()
        for line in lines:
            task_data = line.strip().split(",")
            if len(task_data) == 4:
                name, importance, lightness, deadline_date = task_data
                importance = int(importance)
                lightness = int(lightness)
                deadline_date = datetime.datetime.strptime(deadline_date, "%Y-%m-%d %H:%M:%S")
                task = {
                    "name": name,
                    "importance": importance,
                    "lightness": lightness,
                    "deadline_date": deadline_date
                }
                tasks.append(task)

if __name__ == "__main__":
    while True:
        choice = input("新しいタスクを追加しますか？(y/n):").lower()

        if choice != "y":
            break

        # ---------タスクの情報をユーザーから入力-------------
        name = input("タスクの名前: ")
        importance = int(input("重要度 (0から10の範囲): "))
        lightness = int(input("軽さ (0から10の範囲): "))
        current_year = datetime.datetime.now().year 
        if input("締切は今年ですか？(y/n): ").lower() == "y":
            year = current_year
        else:
            year=int(input("締め切り日の年(2022): "))
        month = int(input("締切日の月 (1から12): "))
        day = int(input("締切日の日 (1から31): "))
        # 時間を設定しますか？と聞き、nだったら11:59 PMにする
        time_set = input("終日にしますか？(y/n): ").lower()
        if time_set != "y":
            hour = int(input("時間 (0から23): "))
            minute = int(input("分 (0から59): "))
        else:
            hour = 23  # 11:59 PM
            minute = 59
        #------------------------------------------
        
        # タスクを辞書形式でリストに追加
        deadline_date = datetime.datetime(year, month, day, hour, minute)
        task = {
            "name": name,
            "importance": importance,
            "lightness": lightness,
            "deadline_date": deadline_date
        }
        tasks.append(task)

        # 追加したタスクの詳細を表示
        print("")
        print("[新しいタスクを追加しました]:")
        print(f"  タスク名: {task['name']}")
        print(f"  重要度: {task['importance']}")
        print(f"  軽さ: {task['lightness']}")
        print(f"  締切日: {task['deadline_date']}")
        print("")

    # タスクを優先度順に並び替えて結果を取得します
    sorted_tasks = sort_tasks(tasks)

    # 優先度順に並び替えたタスクを表示します
    print("優先度順のタスクリスト:")
    for i, task in enumerate(sorted_tasks, start=1):
        print(f"タスク{i}:")
        print(f"  名前: {task['name']}")
        print(f"  重要度: {task['importance']}")
        print(f"  軽さ: {task['lightness']}")
        print(f"  締切日: {task['deadline_date'].strftime('%Y-%m-%d %I:%M %p')}")
        print("")
    
    # タスクをファイルに書き込みます（utf-8エンコードを指定）
    with open(task_file, "w", encoding='utf-8') as file:
        for task in tasks:
            file.write(f"{task['name']},{task['importance']},{task['lightness']},{task['deadline_date']}\n")