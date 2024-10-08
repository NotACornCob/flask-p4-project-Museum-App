import { useState, useEffect, useContext } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import Button from '@mui/material/Button';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { SocketContext } from '../../context/SocketContext.jsx';
import { useNotification } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';

function InstallationCard({installation}) {
  const [buttonStatus, setButtonStatus] = useState(false);
  const [cookies] = useCookies('session_id');
  const [installation_id, setInstallationId] = useState('');
  const user_id = cookies.session_id;
  const [receivedUsernames, setReceivedUsernames] = useState([]);
  const [receivedInstallations, setReceivedInstallations] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const socket = useContext(SocketContext);
  const { addNotification } = useNotification();
  const { addToast } = useToast();

  const notify = (data) => {
    const message = `${data} has gained 3 points!`;
    addToast(message);
    toast(message, {
      theme: "dark",
      limit: 1,
    });
  };

  const handleClick = (value) => {
    setButtonStatus(!buttonStatus);
    setInstallationId(installation.id);
  };  

  useEffect(() => {
    if (buttonStatus && socket) {
      console.log('client connected');
      socket.volatile.emit('interact', user_id, installation_id);
      socket.on("interact_data", (username, installation) => {
        console.log("data received");
        if (!receivedUsernames.includes(username) || !receivedInstallations.includes(installation)) {
          addNotification("New message received!");
          notify(username);
          setReceivedUsernames((prevUsernames) => [...prevUsernames, username]);
          setReceivedInstallations((prevInstallations) => [...prevInstallations, installation]);
        }
      });

      return () => {
        socket.off("interact_data");
      };
    }
  }, [buttonStatus, socket, user_id, installation_id, receivedUsernames, receivedInstallations, addNotification]);

  return (
    <div>
      <Card color="primary" elevation={4}>
        <CardContent>
          <CardActionArea>
            <CardMedia
              component="img"
              height="200"
              image={installation.image_url}
              alt="featured installation"
            />
          </CardActionArea>
          <Typography gutterBottom component="div">
            {installation.name}
          </Typography>
          <Button variant="contained" className="btn" color="primary" fullWidth onClick={handleClick}>
            Interact
          </Button> 
        </CardContent>
      </Card>
      <br/>
    </div>
  );
}

export default InstallationCard;