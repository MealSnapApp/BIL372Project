import { useEffect, useRef, useState } from 'react'
import { logout } from '../../services/AuthServices/AuthService.export';
// import { getRecipeByCategory, getRecipesByType } from '../../services/RecipeServices/RecipeService.export';
import { useNavigate } from 'react-router-dom';
import { ToastMessage } from '../../utils/ToastMessage/ToastMessage';

const useUpperMenuBar = () => {

    const navigate = useNavigate();
    const { contextHolder, showNotification } = ToastMessage();

    const [isProfileVisible, setIsProfileVisible] = useState(false);
    const [hasBeenClickedToProfile, setHasBeenClickedToProfile] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const [isRecipesVisible, setIsRecipesVisible] = useState(false);
    const [isTrendsVisible, setIsTrendsVisible] = useState(false);
    const [isMouseOnSaveMeal, setIsMouseOnSaveMeal] = useState(false);
    const [postsClickedAnim, setPostsClickedAnim] = useState(false);

    const profileMenuRef = useRef<HTMLDivElement>(null);
    const mainMenuRef = useRef<HTMLDivElement>(null);
    const menuContentRef = useRef<HTMLDivElement>(null);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    useEffect(() => {
        if (isProfileVisible)
            setHasBeenClickedToProfile(true);
    }, [isProfileVisible])

    useEffect(() => {
      const handleScroll = () => {
        if (isRecipesVisible) {
          setIsRecipesVisible(false);
        }
        if (isTrendsVisible) {
          setIsTrendsVisible(false);
        }
      };
        window.addEventListener('scroll', handleScroll);

        return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, [isRecipesVisible, isTrendsVisible]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if ((mainMenuRef.current && !mainMenuRef.current.contains(event.target as Node)) &&
                (menuContentRef.current && !menuContentRef.current.contains(event.target as Node))) {
                setIsMenuVisible(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return() => {
            document.removeEventListener('mousedown', handleClickOutside); // Component unmount
        }
    }, [])

    const handleLogoClick = () => {
        // If the user is already on the home page, do not navigate again
        if (window.location.pathname === "/home") {
            return; 
        }
        navigate("/home");
    }

    const handleRecipesClick = () => {
        handleBringTheChosens(); // Fetch recipes based on selected categories
    }

    const handlePostsClick = () => {
        setPostsClickedAnim(true);
        setTimeout(() => setPostsClickedAnim(false), 300);
        if (window.location.pathname === "/posts") {
            return;
        }
        navigate("/posts");
    }

    const handleBringTheChosens = () => {

        // If no categories are selected, do not proceed
        if (selectedCategories.length === 0 && selectedTypes.length === 0) {
            showNotification("Please select at least one category to view recipes.", "warning");
            return;
        }

        const params = new URLSearchParams();
        if (selectedCategories.length > 0) {
            params.append('category', selectedCategories.join(','));
        }
        if (selectedTypes.length > 0) {
            params.append('type', selectedTypes.join(','));
        }

        navigate(`/posts?${params.toString()}`);
    }

const handleTrendsClick = (period: string) => {
    const currentParams = new URLSearchParams(window.location.search);
    const currentPeriod = currentParams.get("period");

    if (window.location.pathname === "/trends" && currentPeriod === period) {
        return;
    }

    navigate(`/trends?period=${period}`);
};

    // Send Recipe Button
    const handleSaveMealClick = () => {
        // If the user is already on the save-meal page, do not navigate again
        if (window.location.pathname === "/save-meal") {
            return; 
        }
        navigate("/save-meal");
    }

    // Profile Menu Button
    const handleProfileClick = () => {
        setIsProfileVisible(!isProfileVisible);
    }

    const handleMyProfileClick = () => {
        // If the user is already on the profile page, do not navigate again
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

    // Saved Recipes Button
    const handleSavedRecipes = () => {
        // If the user is already on the saved-recipes page, do not navigate again
        if (window.location.pathname === "/saved-recipes") {
            return; 
        }
        navigate("/saved-recipes");
    }

    // Liked Recipes Button
    const handleLikedRecipes = () => {
        // If the user is already on the liked-recipes page, do not navigate again
        if (window.location.pathname === "/liked-recipes") {
            return; 
        }
        navigate("/liked-recipes");
    }

    // Logout Button
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

    // Main Menu Button (When the screen is narrow)
    const handleMenuClick = () => {
        setIsMenuVisible(!isMenuVisible);
    }

    return {
        contextHolder,
        isProfileVisible,
        hasBeenClickedToProfile,
        profileMenuRef,
        mainMenuRef,
        menuContentRef,
        isMenuVisible,
        isRecipesVisible,
        setIsRecipesVisible,
        isTrendsVisible,
        setIsTrendsVisible,
        isMouseOnSaveMeal,
        setIsMouseOnSaveMeal,
        handleLogoClick,
        handleRecipesClick,
        handleTrendsClick,
        handlePostsClick,
        handleSaveMealClick,
        handleProfileClick,
        handleMyProfileClick,
        handleMyPosts,
        handleSavedRecipes,
        handleLikedRecipes,
        handleMenuClick,
        handleLogout,
        handleBringTheChosens,
        selectedCategories,
        setSelectedCategories,
        selectedTypes,
        setSelectedTypes,
        postsClickedAnim,
    }  
}
export default useUpperMenuBar