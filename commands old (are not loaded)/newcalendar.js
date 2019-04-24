const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const TOKEN = '447039693931-ql78g8nu5d08shemcacirq4ukof44tui.apps.googleusercontent.com';
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const blogger = google.blogger({
  version: 'v3',
  auth: '447039693931-n0nchpakth25ll0rj20oa6c538iojcc3.apps.googleusercontent.com'
});

var event = {
  'summary': 'Google I/O 2015 apit test',
  'location': 'here on discord',
  'description': 'This is a test event, hopefully this works so that i can then itegrate it!',
  'start': {
    'dateTime': '2019-04-24T09:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  // 'end': {
  //   'dateTime': '2015-05-28T17:00:00-07:00',
  //   'timeZone': 'America/Los_Angeles',
  // },
  // 'recurrence': [
  //   'RRULE:FREQ=DAILY;COUNT=2'
  // ],
  // 'attendees': [
  //   {'email': 'lpage@example.com'},
  //   {'email': 'sbrin@example.com'},
  // ],
  'reminders': {
    'useDefault': false,
    // 'overrides': [
    //   {'method': 'email', 'minutes': 24 * 60},
    //   {'method': 'popup', 'minutes': 10},
    // ],
  },
};






module.exports = {
  'CommandArray':[
    {
      "name":"calendar",
      "description":"",
      "adminOnly":true,
      "run": async function run(client, msg, args){


        calendar.events.insert({
          calendarId: '1mb4e0397qs9ofi7ajg524enak',
          resource: event,
        }, function(err, event) {
          if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
          }
          console.log('Event created: %s', event.htmlLink);
        });

        
      }
    }
  ]
}
