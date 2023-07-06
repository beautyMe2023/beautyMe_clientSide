import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Linking } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
import Alert from './Alert';
import { Button } from 'react-native-paper';
import { GetAllAppointmentForProWithClient } from './obj/FunctionAPICode';
import { ConfirmAppointment } from './obj/FunctionAPICode';
import { faSpa } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../comps/UserDietails';
import { CancelAppointmentByClient } from './obj/FunctionAPICode';
import { Post_SendPushNotification } from './obj/FunctionAPICode';
const New_Calendar = () => {
  const { userDetails, setUserDetails } = useContext(UserContext);
  const BussinesNumber = userDetails.Business_Number;
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [arr, setArr] = useState([]);
  const [showDetails, setShowDetails] = useState(true);
  const [alert, setAlert] = useState();
  const [tokenClient, setToken] = useState();
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    if (tokenClient) {
      const body = {
        "to": tokenClient,
        "title": "BeautyMe",
        "body": `לצערנו התור שקבעת התבטל`,
        "badge": "0",
        "ttl": "1",
        "data": {
          "to": tokenClient
        }
      }
      Post_SendPushNotification(body).then
        (() => {
          console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%")
        }
        )
    }

  }, [tokenClient]);

  useEffect(() => {
    GetAllAppointmentForProWithClient(BussinesNumber)
      .then((data) => {
        let arr1 = [];
        let obj = {
          Number_appointment: data[0].Number_appointment,
          Date: data[0].Date,
          Appointment_status: data[0].Appointment_status,
          Start_Hour: data[0].Start_Hour,
          End_Hour: data[0].End_Hour,
          Name_type: data[0].Name,
          Client: {
            ID_Client: data[0].ID_Client,
            First_name: data[0].First_name,
            Last_name: data[0].Last_name,
            ClientPhone: data[0].phone,
            AddressStreet: data[0].AddressStreet,
            AddressCity: data[0].AddressCity,
            AddressHouseNumber: data[0].AddressHouseNumber,
            Facebook_link: data[0].Facebook_link,
            Instagram_link: data[0].Instagram_link,
            ProfilPic: data[0].ProfilPic,
            token: data[0].token,
          },
        };
        arr1.push(obj);
        for (let i = 1; i < data.length; i++) {
          if (data[i].Number_appointment !== data[i - 1].Number_appointment) {
            obj = {
              Number_appointment: data[i].Number_appointment,
              Date: data[i].Date,
              Appointment_status: data[i].Appointment_status,
              Start_Hour: data[i].Start_Hour,
              End_Hour: data[i].End_Hour,
              Name_type: data[i].Name,
              Client: {
                ID_Client: data[i].ID_Client,
                First_name: data[i].First_name,
                Last_name: data[i].Last_name,
                ClientPhone: data[i].phone,
                AddressStreet: data[i].AddressStreet,
                AddressCity: data[i].AddressCity,
                AddressHouseNumber: data[i].AddressHouseNumber,
                Facebook_link: data[i].Facebook_link,
                Instagram_link: data[i].Instagram_link,
                ProfilPic: data[i].ProfilPic,
                token: data[i].token,
              },
            };
            arr1.push(obj);
          }
        }
        setArr(arr1);
        console.log(arr1, "222222222222222222222222222222222");
        console.log(
          `Business ${data[0].Business_Number} has ${arr1.length} appointments on ${data[0].Date}:` +
          JSON.stringify(arr)
        );
      })
      .catch((error) => {
        console.log("error!!!!!!!!!!!!!!!!!!!!!!!!!!!", error);
      });
  }, []);

  useEffect(() => {
    // יצירת מערך התאריכים המסומנים עם הנקודות
    const markedDates = arr.reduce((markedDatesObj, appointment) => {
      const appointmentDate = moment(appointment.Date).format("YYYY-MM-DD");
      const markedDate = {
        marked: true,
        dotColor: "rgb(92, 71, 205)",
        activeOpacity: 0.7,
        selectedColor: "green",
        customStyles: {
          text: {
            color: "red",
          },
        },
      };
      // אם התאריך כבר קיים במערך, מוסיף את התוויות החדשות לתאריך הקיים
      if (markedDatesObj[appointmentDate]) {
        markedDatesObj[appointmentDate] = {
          ...markedDatesObj[appointmentDate],
          ...markedDate,
        };
      }
      // אחרת, הוסף את התווית לתאריך החדש
      else {
        markedDatesObj[appointmentDate] = markedDate;
      }
      return markedDatesObj;
    }, {});

    // עדכון המשתנה markedDates באמצעות הפונקציה setMarkedDates
    setMarkedDates(markedDates);
  }, [arr]);

  const handleDayPress = (day) => {
    const selectedDate = day.dateString;
    const selectedAppointments = arr.filter(
      (appointment) =>
        moment(appointment.Date).format() === moment(selectedDate).format()
    );

    setSelectedDate(selectedDate);
    setSelectedAppointments(selectedAppointments);
    setShowDetails(true);
  };

  const confirmStatus = (Number_appointment, token) => {
    ConfirmAppointment(Number_appointment)
      .then((result) => {
        if (result.data) {
          console.log(result.data);
          setAlert(
            <Alert
              text="התור אושר בהצלחה, נשלחה הודעה ללקוח"
              type="worng"
              time={1000}
              bottom={100}
            />
          );
          setToken(token);
        }
      })
      .catch((error) => {
        console.log("error", error);
        setAlert(
          <Alert
            text="לא הצלחנו לאשר, אנא נסה שוב מאוחר יותר"
            type="worng"
            time={1000}
            bottom={100}
          />
        );
      });
  };


  const cancel = (Number_appointment, token) => {
    CancelAppointmentByClient(Number_appointment).then((result) => {
      if (result.data) {
        console.log(result.data, "**********************");
        setAlert(
          <Alert
            text="התור בוטל נשלחה הודעה ללקוח על ביטול התור"
            type="worng"
            time={1000}
            bottom={600}
          />
        )
        console.log(token, "**********************************************cancellll")
        setToken(token);
      }
    })
      .catch((error) => {
        console.log("error", error);

      });
  };
  LocaleConfig.locales["he"] = {
    monthNames: [
      "ינואר",
      "פברואר",
      "מרץ",
      "אפריל",
      "מאי",
      "יוני",
      "יולי",
      "אוגוסט",
      "ספטמבר",
      "אוקטובר",
      "נובמבר",
      "דצמבר",
    ],
    monthNamesShort: [
      "ינו",
      "פבר",
      "מרץ",
      "אפר",
      "מאי",
      "יוני",
      "יולי",
      "אוג",
      "ספט",
      "אוק",
      "נוב",
      "דצמ",
    ],
    dayNames: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
    dayNamesShort: ["א", "ב", "ג", "ד", "ה", "ו", "ש"],
  };

  LocaleConfig.defaultLocale = "he";

  return (
    <ScrollView>
      {alert && alert}
      <View>
        <Calendar
          style={styles.calendarContainer}
          markedDates={markedDates}
          onDayPress={handleDayPress}
        />

        {selectedAppointments.map((appointment) => (
          <TouchableOpacity
            style={styles.card}
            key={appointment.Number_appointment}
            onPress={() => setShowDetails(!showDetails)}
          >
            {showDetails && (
              <>
                <ScrollView>
                  <View>
                    <Text style={styles.title}>פרטי התור:</Text>
                  </View>
                  <View style={styles.iconContainer}>
                    <Icon name="leaf" size={20} color="black" style={styles.icon} />
                    <Text style={styles.text}>{appointment.Name_type}</Text>
                  </View>

                  <View style={styles.iconContainer}>
                    <Icon name="clock-o" size={20} color="black" style={styles.icon} />
                    <Text style={styles.text}>
                      {moment(appointment.Start_Hour, "HH:mm").format("HH:mm")} -{" "}
                      {moment(appointment.End_Hour, "HH:mm").format("HH:mm")}
                    </Text>

                  </View>

                  {/* 
                  {appointment.Appointment_status === "confirmed" ? (
                    <View style={styles.iconContainer}>
                      <Text style={styles.text}>התור אושר </Text>
                      <Icon name="check-circle" size={20} color="green" />
                    </View>
                  ) : (
                    <View style={styles.columnContainer}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.text}>התור ממתין לאישור </Text>
                        <Icon name="hourglass" size={20} color="orange" />
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          confirmStatus(
                            appointment.Number_appointment,
                            appointment.Client.token
                          )
                        }
                      >
                        <Text style={styles.linkText}>
                          לחץ כאן לאישור התור
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )} */}


                  {appointment.Is_client_house === "YES" || "YES       " ? (
                    <View style={styles.iconContainer}>
                      <Icon name="home" size={20} color="black" />
                      <Text style={styles.text}>  טיפול בבית הלקוח </Text>

                    </View>

                  ) : (
                    <>

                      <Icon name="briefcase" size={20} color="black" style={styles.icon} />
                      טיפול בבית העסק
                    </>
                  )}


                  <Text style={styles.title}>פרטי הלקוח:</Text>

                  <Text style={styles.text}>
                    {appointment.Client.First_name} {appointment.Client.Last_name}
                  </Text>

                  {appointment.Is_client_house === "YES" || "YES       " ? (
                    <View style={styles.iconContainer}>
                      <Icon name="map-marker" size={20} color="#000" style={styles.icon} />
                      <Text style={styles.text}>
                        {`${appointment.Client.AddressCity}, ${appointment.Client.AddressStreet} ${appointment.Client.AddressHouseNumber}`}
                      </Text>

                    </View>
                  ) : null}

                  <View style={styles.iconContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(`tel:${appointment.Client.ClientPhone}`)
                      }
                    >
                      <Icon
                        name="phone"
                        size={25}
                        color="rgb(92, 71, 205)"
                        style={styles.icon}
                      />
                    </TouchableOpacity>
                    {appointment.Client.Instagram_link ? (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(appointment.Instagram_link)}
                      >
                        <Icon
                          name="instagram"
                          size={25}
                          color="rgb(92, 71, 205)"
                          style={styles.icon}
                        />
                      </TouchableOpacity>
                    ) : null}

                    {appointment.Client.Facebook_link ? (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(appointment.Client.Facebook_link)}
                      >
                        <Icon
                          name="facebook"
                          size={25}
                          color="rgb(92, 71, 205)"
                          style={styles.icon}
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <View style={styles.container1}>
                    <TouchableOpacity onPress={cancel(appointment.Number_appointment, appointment.Client.token)
                    }>

                      <Icon name="times-circle" size={30} color="#900" />
                      <Text style={styles.text}>ביטול תור</Text>

                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 20,
    borderColor: "rgb(92, 71, 205)",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "white",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "left",
    fontSize: 20,
    paddingTop: 5
  },
  text: {
    fontSize: 15,
    textAlign: "left",
    marginLeft: 10
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  linkText: {
    color: "rgb(92, 71, 205)",
    textDecorationLine: "underline",
  },
  columnContainer: {
    flexDirection: "column",
    alignItems: "left",
    justifyContent: "center",
  },
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
  },
  selectedText: {
    color: "blue",
    fontWeight: "bold",
  },
  defaultText: {
    color: "black",
  },
  dateText: {
    fontSize: 18,
    textAlign: "center",
    color: "black",
  },
  dateTextWithEvents: {
    fontSize: 18,
    textAlign: "center",
    color: "blue",
    fontWeight: "bold",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "blue",
    alignSelf: "center",
    marginTop: 2,
  },
  container1: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default New_Calendar;