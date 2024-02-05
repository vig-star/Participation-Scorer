from flask import Flask, request
import requests
import sys

app = Flask(__name__)
TOKEN = ""
ED_HOST = "https://us.edstem.org/api"
COURSE_ID = "49507"
EXCLUDED_WORDS = ["thank", "thanks", "appreciate"]
MIN_WORDS = 4
INCLUDE_LENGTH = 15


def request_ed_api(method, url, params=None):
    headers = {'Authorization': 'Bearer ' + TOKEN}
    try:
        response = requests.request(method, url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error sending request to {url}. Error: {e}')
        sys.exit(1)

def fetch_all_user_activity(user_id, activity_type='comment', filter='all'):
    filtered_activities = []
    offset = 0
    limit = 100
    while True:
        params = {
            "courseID": COURSE_ID,
            "offset": offset,
            "limit": limit,
            "filter": filter,
        }
        response = request_ed_api('GET', f"{ED_HOST}/users/{user_id}/profile/activity", params=params)
        activities = response.get('items', [])
        if not activities:
            break
        # print([activity for activity in activities if activity['type'] == activity_type])
        for activity in activities:
            if 'type' in activity and activity['type'] == activity_type and 'value' in activity and 'document' in activity['value'] and len(activity['value']['document']) > MIN_WORDS:
                activity_text = activity['value']['document']
                if activity_type == 'comment' and not (any(word in activity_text.lower() for word in EXCLUDED_WORDS) and len(activity_text) < INCLUDE_LENGTH):
                    filtered_activities.append(activity) 
                elif activity_type != 'comment':
                    filtered_activities.append(activity) 
                else:
                    print(activity_text, end='\n\n')

            elif activity['type'] == 'thread' and 'value' in activity and 'type' in activity['value'] and activity['value']['type'] == activity_type:
                if activity_type == 'question' or activity_type == 'post' or activity_type == 'answer': 
                    filtered_activities.append(activity['value'])
        offset += limit
        # print(filtered_activities)

    return filtered_activities

def fetch_course_users(include_admin=False):
    url = f"{ED_HOST}/courses/{COURSE_ID}/analytics/users"
    headers = {'Authorization': 'Bearer ' + TOKEN}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        users_data = response.json()
        all_users = users_data.get('users', [])
        print(include_admin)
        if include_admin:
            return all_users
        filtered_users = [user for user in all_users if user['course_role'] != 'admin']
        return filtered_users
    except requests.exceptions.RequestException as e:
        print(f"Error fetching all course users: {e}")
        return []

@app.route('/user_activity')
def user_activity():
    user_id = request.args.get('user_id', 0, type=int)
    activity_type = request.args.get('activity_type', '')

    if not user_id:
        return "User ID is required", 400
    if not activity_type:
        return "Valid activity type required", 400
    if activity_type != 'comment' and activity_type != 'post' and activity_type != 'question' and activity_type != 'answer':
        return "Valid activity type required", 400
    
    activities = fetch_all_user_activity(user_id, activity_type)
    return activities

@app.route('/course_users')
def course_users():
    include_admin = request.args.get('include_admin', False, type=bool)
    users = fetch_course_users(include_admin)
    return users