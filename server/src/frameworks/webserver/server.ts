<<<<<<< HEAD
import { Server } from 'http';
import configKeys from '../../config';

const serverConfig = (server: Server) => {
  const startServer = () => {
    const port = configKeys.PORT || 5000;
    server.listen(port, () => {
      console.log(
        `🚀 Server is running at http://localhost:${port}`.bg_blue.bold
      );
    });
  };

  return {
    startServer,
  };
};

export default serverConfig;
=======
import { Server } from "http";
import configKeys from "../../config";

const serverConfig = (server:Server) => {
    const startServer = () => { 
        server.listen(configKeys.PORT, () => {
            console.log(`Server listening on Port ${configKeys.PORT}`.bg_blue.bold);
        })
    }
    return {
        startServer
    }
}

export default serverConfig
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
