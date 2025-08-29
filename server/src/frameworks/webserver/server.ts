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
