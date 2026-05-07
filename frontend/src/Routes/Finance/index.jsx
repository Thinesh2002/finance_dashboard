import { Route } from "react-router-dom";
import Layout from "../../pages/compnents/Layout";
import ProtectedRoute from "../../config/ProtectedRoute";
import F_Dashboard from "../../pages/Finance/index";
import F_Create from "../../pages//Finance/Create/index";

const Manual_Order_Route = (
  <>
    <Route
      path="/finance-dashboard"
      element={
        <ProtectedRoute>
          <Layout>
            <F_Dashboard />
          </Layout>
        </ProtectedRoute>
      }
    />

        <Route
      path="/finance-create"
      element={
        <ProtectedRoute>
          <Layout>
            <F_Create />
          </Layout>
        </ProtectedRoute>
      }
    />

    
  </>
);

export default Manual_Order_Route;