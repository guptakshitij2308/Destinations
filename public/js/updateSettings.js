import axios from "axios";
import { showAlert } from "./alerts.js";

exports.updateData = async (data, type) => {
  // type : pasword or data
  //   data is an object of properties which we want to update.
  try {
    const res = await axios({
      method: "PATCH",
      url:
        type === "data"
          ? "/api/v1/users/updateMe"
          : "/api/v1/users/updatePassword",
      data,
    });
    if (res.data.status === "success") {
      location.reload(true);
      showAlert("success", "Updated successfully.");
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
    console.error(err);
  }
};
