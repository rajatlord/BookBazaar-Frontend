import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export const NotFoundPage: React.FC = () => {
  const navgiate = useNavigate();

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Result
        status={404}
        title="Page not found"
        subTitle="The page you're looking for doesn't exist."
        extra={
          <Button
            type="primary"
            onClick={() => navgiate("/books")}
            style={{ borderRadius: 980 }}
          >
            Back to Books
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;