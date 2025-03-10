import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  clearAllUpdateProfileErrors,
  updateProfile,
} from "../store/slices/updateProfileSlice";
import { toast } from "react-toastify";
import { getUser } from "../store/slices/userSlice";

const UpdateProfile = () => {
  const { user } = useSelector((state) => state.user);
  const { loading, error, isUpdated } = useSelector(
    (state) => state.updateProfile
  );

  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  // Ensure dropdowns have default values
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [coverLetter, setCoverLetter] = useState(user?.coverLetter || '');
  const [firstNiche, setFirstNiche] = useState(user?.niches?.firstNiche || 'Software Development');
  const [secondNiche, setSecondNiche] = useState(user?.niches?.secondNiche || 'Web Development');
  const [thirdNiche, setThirdNiche] = useState(user?.niches?.thirdNiche || 'Data Science');
  const [resume, setResume] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [resumePreview, setResumePreview] = useState(user?.resume?.url || '');

  const handleUpdateProfile = async () => {
    if (user && user.role === "Job Seeker") {
      if (!firstNiche || !secondNiche || !thirdNiche) {
        toast.error("Please select all three job niches.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);

    if (user && user.role === "Job Seeker") {
      formData.append("firstNiche", firstNiche);
      formData.append("secondNiche", secondNiche);
      formData.append("thirdNiche", thirdNiche);
      formData.append("coverLetter", coverLetter);
    }

    if (resume) {
      formData.append("resume", resume);
    }

    // Log form data to debug
    console.log("🟢 Sending Form Data:", Object.fromEntries(formData.entries()));

    await dispatch(updateProfile(formData));
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCoverLetter(user.coverLetter || '');
      setFirstNiche(user.niches?.firstNiche || 'Software Development');
      setSecondNiche(user.niches?.secondNiche || 'Web Development');
      setThirdNiche(user.niches?.thirdNiche || 'Data Science');
      setResumePreview(user.resume?.url || '');
    }
  }, [user]);

  useEffect(() => {
    if (error && !loading) {
      toast.error(error);
      dispatch(clearAllUpdateProfileErrors());
    }
    if (isUpdated) {
      toast.success("Profile Updated.");
      dispatch(getUser());
      dispatch(clearAllUpdateProfileErrors());
      navigateTo("/profile"); // Redirect user after update
    }
  }, [dispatch, loading, error, isUpdated, navigateTo]);

  const resumeHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    setSelectedFileName(file.name);

    reader.readAsDataURL(file);
    reader.onload = () => {
      setResumePreview(reader.result);
      setResume(file);
    };
  };

  const nichesArray = [
    "Software Development",
    "Web Development",
    "Cybersecurity",
    "Data Science",
    "Artificial Intelligence",
    "Cloud Computing",
    "DevOps",
    "Mobile App Development",
    "Blockchain",
    "Database Administration",
    "Network Administration",
    "UI/UX Design",
    "Game Development",
    "IoT (Internet of Things)",
    "Big Data",
    "Machine Learning",
    "IT Project Management",
    "IT Support and Helpdesk",
    "Systems Administration",
    "IT Consulting",
  ];

  return (
    <div className="account_components">
      <h3>Update Profile</h3>
      <div>
        <label>Full Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Email Address</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Phone Number</label>
        <input type="number" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label>Address</label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      {user && user.role === "Job Seeker" && (
        <>
          <div>
            <label>My Preferred Job Niches</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {[setFirstNiche, setSecondNiche, setThirdNiche].map((setter, index) => (
                <select key={index} value={[firstNiche, secondNiche, thirdNiche][index]} onChange={(e) => setter(e.target.value)}>
                  {nichesArray.map((element, i) => (
                    <option value={element} key={i}>{element}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>
          <div>
            <label>Cover Letter</label>
            <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={5} />
          </div>
          <div>
            <label>Upload Resume</label>
            <input type="file" onChange={resumeHandler} />
            {resume && <p>Selected File: {selectedFileName}</p>}
            {user.resume && (
              <div>
                <p>Current Resume:</p>
                <Link to={user.resume.url} target="_blank" className="view-resume">
                  View Resume
                </Link>
              </div>
            )}
          </div>
        </>
      )}
      <div className="save_change_btn_wrapper">
        <button className="btn" onClick={handleUpdateProfile} disabled={loading}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default UpdateProfile;
