import { useEffect, useState } from "react";

import "./NotificationBell.css";


function NotificationBell() {

  const [notifications, setNotifications] = useState([]);

  const [isOpen, setIsOpen] = useState(false);


  const loadNotifications = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:5000/api/notifications/"
      );

      const data = await response.json();

      setNotifications(
        data.notifications || []
      );

    } catch (error) {

      console.error(
        "Notification loading error:",
        error
      );

    }

  };


  useEffect(() => {

    loadNotifications();

    const interval = setInterval(
      loadNotifications,
      60000
    );

    return () => clearInterval(interval);

  }, []);


  return (

    <div className="notification-container">

      <button
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
      >

        🔔

        {notifications.length > 0 && (

          <span className="notification-badge">

            {notifications.length}

          </span>

        )}

      </button>


      {isOpen && (

        <div className="notification-panel">

          <div className="notification-header">

            <h3>Notifications</h3>

            <span>

              {notifications.length}

            </span>

          </div>


          {notifications.length === 0 ? (

            <p className="no-notifications">

              No notifications

            </p>

          ) : (

            <div className="notification-list">

              {notifications.map(
                (notification, index) => (

                  <div
                    className="notification-item"
                    key={index}
                  >

                    <strong>

                      {notification.title}

                    </strong>

                    <p>

                      {notification.message}

                    </p>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      )}

    </div>

  );

}


export default NotificationBell;