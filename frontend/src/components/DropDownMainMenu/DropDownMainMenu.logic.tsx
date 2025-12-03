import { logout } from '../../services/AuthServices/AuthService.export';
import { useNavigate } from 'react-router-dom';


const useDropDownMainMenu = () => {

    const navigate = useNavigate();

    const handleMyProfileClick = () => {
        // Keep existing profile route
        if (window.location.pathname === "/user-recipes") {
            return; 
        }
        navigate("/user-recipes");
    }

    const handleMyPosts = () => {
        if (window.location.pathname === "/user-posts") {
            return;
        }
        navigate("/user-posts");
    }

    const handleSavedRecipes = () => {
        // If the user is already on the saved-posts page, do not navigate again
        if (window.location.pathname === "/saved-posts") {
            return; 
        }
        navigate("/saved-posts");
    }

    const handleLikedRecipes = () => {
        // If the user is already on the liked-posts page, do not navigate again
        if (window.location.pathname === "/liked-posts") {
            return; 
        }
        navigate("/liked-posts");
    }

    const handleSendRecipe = () => {
        // If the user is already on the send-recipe page, do not navigate again
        if (window.location.pathname === "/send-recipe") {
            return; 
        }
        navigate("/send-recipe");
    }

    const handleTrends = () => {
        // If the user is already on the trends page, do not navigate again
        if (window.location.pathname === "/trends") {
            return; 
        }
        navigate("/trends");
    }

    const handleLogout =  async () => {
        logout().then((response:any) => {
            if (response && response.success){
                navigate("/login");
            }
        })
        .catch((error) => {
            console.error("Logout failed:", error);
        });   
    }

  return {
    handleMyProfileClick,
        handleMyPosts,
    handleSavedRecipes,
    handleLikedRecipes,
    handleSendRecipe,
    handleTrends,
    handleLogout
  }
}

export default useDropDownMainMenu
