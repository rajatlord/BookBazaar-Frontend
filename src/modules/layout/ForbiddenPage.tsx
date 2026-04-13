import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export const ForbiddenPage: React.FC=()=>{
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
        status={403}
        title="Access denied"
        subTitle="You don't have permission to view this page."
        extra={
          <Button
            type="primary"
            onClick={() => navgiate("/books")}
            style={{ borderRadius: 980 }}
          >
            Go home
          </Button>
        }
      />
    </div>
  );
};

export default ForbiddenPage;