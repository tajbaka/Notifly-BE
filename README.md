# Notifly Back End

Application URL: https://notifly-dbce7.firebaseapp.com/schedule

## Summary:
Notifly is a scheduling application that allows clients to book in their customers on their schedule. Similar to calendly. 

### Tech Involved: 
* **Web Application Back End**: Firebase functions which is running Nodejs. 

### Challenges:
### Challenge 1: Registration
* **Goal**: Sneakily register users giving a user experience that is seemless.
* **Reasoning**: No one likes to create more accounts on applications.
* **What We Did**: User's are able to see different calendars based on the ending url without signing up. When making their first booking, users just enter their name, last name, email and phone number. The event is created and also their account is made.

### Challenge 2: Real-time data updates
* **Goal**: To allow users to book in events and admins to change their schedule real time without conflicts.
* **Reasoning**:  Users need to constantly be seeing the updated schedule so there are no double booking conflicts.
* **What We Did**: We used firebaseDB's websockets to ensure real time data updates. It is fast other than first time load, and automatically scales.
