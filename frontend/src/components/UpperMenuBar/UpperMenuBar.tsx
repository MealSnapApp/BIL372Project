import useUpperMenuBar from './UpperMenuBar.logic';
import './UpperMenuBar.css'

import DropDownMainMenu from '../DropDownMainMenu/DropDownMainMenu';
import DropdownMenuElement from '../DropdownMenuElement/DropdownMenuElement';

import { categoryTypes } from '../../config/constants';
import { categoryImages } from '../../config/constants';

import logo from '../../assets/my-recipes-logo.jpg';
import hour24 from '../../assets/trends/24-hours.png';
import week from '../../assets/trends/week.png';
import month from '../../assets/trends/month.png';
import annual from '../../assets/trends/annual-calendar.png';
import all from '../../assets/trends/all.png';
import cook from '../../assets/blogs/cooking.png';
import healthy from '../../assets/blogs/healthy-heart.png';
import daily from '../../assets/blogs/daily-tasks.png';
import question from '../../assets/blogs/question.png';

// React Icon imports
import { IconBaseProps } from 'react-icons';
import { FaSearch } from "react-icons/fa";
import { FaRegBell } from "react-icons/fa";
import { MdAccountCircle } from "react-icons/md";
import { RiArrowDownSLine } from "react-icons/ri";
import { HiMiniArrowRight } from "react-icons/hi2";
import { IoLogOutOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { BiLike } from "react-icons/bi";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa";
import { GiRiceCooker } from "react-icons/gi";
import { HiOutlineMenu } from "react-icons/hi";
import { IoBookOutline } from "react-icons/io5";

// Icons
const IconSearch = FaSearch as React.FC<IconBaseProps>;
const IconBell = FaRegBell as React.FC<IconBaseProps>;
const IconArrowDown = RiArrowDownSLine as React.FC<IconBaseProps>;
const IconArrowRight = HiMiniArrowRight as React.FC<IconBaseProps>;
const IconLogout = IoLogOutOutline as React.FC<IconBaseProps>;
const IconSettings = IoSettingsOutline as React.FC<IconBaseProps>;
const IconLike = BiLike as React.FC<IconBaseProps>;
const IconCalendar = FaRegCalendarAlt as React.FC<IconBaseProps>;
const IconBookmark = FaRegBookmark as React.FC<IconBaseProps>;
const IconProfile = MdAccountCircle as React.FC<IconBaseProps>;
const IconCooker = GiRiceCooker as React.FC<IconBaseProps>;
const IconMenu = HiOutlineMenu as React.FC<IconBaseProps>;
const IconBlogs = IoBookOutline as React.FC<IconBaseProps>;


const UpperMenuBar: React.FC = () => {

  const { contextHolder,
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
          handlePostsClick,
          handleTrendsClick,
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
        postsClickedAnim } = useUpperMenuBar();

  return (
    <div className='upper-menu-bar-1'>
      { contextHolder }
      <div className='upper-menu-bar-1 left-side' onClick={handleLogoClick}>
        <div className='logo'><img src={logo} alt='SnapMeal Logo' /></div>
        <div className='tauri-font'>SnapMeal</div>
      </div>
      <div className='upper-menu-bar-1 right-side'>
        <div className='dropdown-menu-wrapper'
          onMouseEnter={() => setIsRecipesVisible(true)}
          onMouseLeave={() => setIsRecipesVisible(false)}
        >
          <div>
            <div className='header-text-with-arrow'>
              <span className={isRecipesVisible ? "title-on-mouse header-text" : "header-text"} onClick={handleRecipesClick}>
                Recipes
              </span>
              <IconArrowDown />
            </div>
            { isRecipesVisible &&
              <div className={`dropdown-menu recipes animate`}>
                  {Object.entries(categoryTypes).map(([header, items]) => (
                    <DropdownMenuElement
                      key={header}
                      selectedCategories={selectedCategories}
                      setSelectedCategories={setSelectedCategories}
                      selectedTypes={selectedTypes}
                      setSelectedTypes={setSelectedTypes}
                      header={header}
                      items={items}
                      img={categoryImages[header]}
                    />
                  ))}
                <div className='bring-the-chosen-recipes' onClick={handleBringTheChosens}>Bring the chosen recipes<IconArrowRight/></div>
              </div>
            }
          </div>

        </div>
        <div className='dropdown-menu-wrapper'>
          <div className='header-text-with-arrow'>
            <span className={`header-text posts-header ${postsClickedAnim ? 'posts-click-anim' : ''}`} onClick={handlePostsClick}>
              Posts
            </span>
          </div>
        </div>

        <div
          onMouseEnter={() => setIsTrendsVisible(true)}
          onMouseLeave={() => setIsTrendsVisible(false)}
          className='dropdown-menu-wrapper'
        >
          <div className='header-text-with-arrow'>
            <span className={isTrendsVisible ? "title-on-mouse header-text" : "header-text"} onClick={() => handleTrendsClick("all-time")}>
              Trends
            </span>
            <IconArrowDown />
          </div>
          {/* Trends dropdown content removed as requested */}
        </div>
        <div className='text'>Contact Us</div>
        <div className='search-bar-wrapper'>
          <input
            type="text"
            placeholder="Search..."
            className='search-bar'
          />
          <div className='search-icon'><IconSearch/></div>
        </div>

        <div 
          onMouseEnter={()=> setIsMouseOnSaveMeal(true)}
          onMouseLeave={()=> setIsMouseOnSaveMeal(false)}
          className='share-recipe'
          onClick={handleSaveMealClick}
          >
            {isMouseOnSaveMeal ? <span className='cooker-icon'><IconCooker/></span> : "Save Meal"}
        </div>

        <div className='bell-icon'><IconBell/></div>
        
        <div ref={profileMenuRef}>
          <div className='profile-icon' onClick={handleProfileClick}><span className='icon'><IconProfile/></span></div>
          {hasBeenClickedToProfile && 
            <div className={`profile-menu${isProfileVisible ? ' animate-in' : ' animate-out'}`}>
              <div className='text' onClick={handleMyProfileClick}><IconProfile/>My Profile</div>
              <div className='text' onClick={handleMyPosts}><IconBlogs/>My Posts</div>
              <div className='text' onClick={handleSavedRecipes}><IconBookmark/>Saved Posts</div>
              <div className='text' onClick={handleLikedRecipes}><IconLike/>Liked Posts</div>
              <div className='text'><IconCalendar/>Plannings</div>
              <div className='text'><IconSettings/>Settings</div>
              <div className='text' onClick={handleLogout}><IconLogout/>Logout</div>
            </div>
          }
        </div>
        <div className='menu-icon' ref={mainMenuRef} onClick={handleMenuClick}><IconMenu /></div>
      </div>
      <DropDownMainMenu isMenuVisible={isMenuVisible} menuRef={menuContentRef}/>
    </div>
  );
};
export default UpperMenuBar