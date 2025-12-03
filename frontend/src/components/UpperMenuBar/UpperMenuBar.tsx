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
import { MdPostAdd } from "react-icons/md";
import { IoBookOutline } from "react-icons/io5";

// Ant Design imports for Modal
import { Modal, Input, Upload, Button, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { createPost, uploadImage } from '../../services/PostServices/PostService';

const { TextArea } = Input;
const { Option } = Select;

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
const IconPost = MdPostAdd as React.FC<IconBaseProps>;
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
          isPostsVisible,
          setIsPostsVisible,
          isMouseOnSaveMeal,
          setIsMouseOnSaveMeal,
          handleLogoClick,
          handleRecipesClick,
          handlePostsClick,
          handlePostsFilterClick,
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

  // Modal State for Post Meal
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [fileList, setFileList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  const handleOk = async () => {
    try {
      setSubmitting(true);
      let image_path: string | undefined = undefined;
      let thumb_path: string | undefined = undefined;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const uploaded = await uploadImage(fileList[0].originFileObj as File);
        image_path = uploaded.path;
        thumb_path = uploaded.thumb_path;
      }

      if (!content.trim() && !image_path) {
        message.warning('Please enter content or choose an image.');
        setSubmitting(false);
        return;
      }

      const resp = await createPost({ 
        content: content.trim() || undefined, 
        image_path, 
        thumb_path,
        category: selectedCategory,
        type: selectedType
      });
      if (resp.success) {
        message.success('Post shared');
        setOpen(false);
        setContent('');
        setFileList([]);
        setSelectedCategory(undefined);
        setSelectedType(undefined);
      } else {
        message.error(resp.errorMessage || 'Failed to share post');
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const beforeUpload = () => {
    return false;
  };

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
        <div 
          className='dropdown-menu-wrapper'
          onMouseEnter={() => setIsPostsVisible(true)}
          onMouseLeave={() => setIsPostsVisible(false)}
        >
          <div className='header-text-with-arrow'>
            <span className={`header-text posts-header ${postsClickedAnim ? 'posts-click-anim' : ''}`} onClick={handlePostsClick}>
              Posts
            </span>
            <IconArrowDown />
          </div>
          {isPostsVisible &&
            <div className={`dropdown-menu trends animate`}>
              <DropdownMenuElement header='All Posts' onClick={() => handlePostsFilterClick("all")}/>
              <DropdownMenuElement header='My Posts' onClick={() => handlePostsFilterClick("mine")}/>
              <DropdownMenuElement header="Other User's Posts" onClick={() => handlePostsFilterClick("others")}/>
            </div>
          }
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
          {isTrendsVisible &&
            <div className={`dropdown-menu trends animate`}>
              <DropdownMenuElement header='Daily Trends' img={hour24} onClick={() => handleTrendsClick("daily")}/>
              <DropdownMenuElement header='Weekly Trends' img={week} onClick={() => handleTrendsClick("weekly")}/>
              <DropdownMenuElement header='Monthly Trends' img={month} onClick={() => handleTrendsClick("monthly")}/>
              <DropdownMenuElement header='Annual Trends' img={annual} onClick={() => handleTrendsClick("annual")}/>
              <DropdownMenuElement header='All Time Trends' img={all} onClick={() => handleTrendsClick("all-time")}/>
            </div>
          }
        </div>
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
          onClick={() => setOpen(true)}
          >
            {isMouseOnSaveMeal ? <span className='cooker-icon'><IconCooker/></span> : "Post Meal"}
        </div>
        
        <div ref={profileMenuRef}>
          <div className='profile-icon' onClick={handleProfileClick}><span className='icon'><IconProfile/></span></div>
          {hasBeenClickedToProfile && 
            <div className={`profile-menu${isProfileVisible ? ' animate-in' : ' animate-out'}`}>
              <div className='text' onClick={handleMyProfileClick}><IconProfile/>My Profile</div>
              <div className='text' onClick={handleMyPosts}><IconBlogs/>My Posts</div>
              <div className='text' onClick={handleSavedRecipes}><IconBookmark/>Saved Posts</div>
              <div className='text' onClick={handleLikedRecipes}><IconLike/>Liked Posts</div>
              <div className='text' onClick={handleLogout}><IconLogout/>Logout</div>
            </div>
          }
        </div>
        <div className='menu-icon' ref={mainMenuRef} onClick={handleMenuClick}><IconMenu /></div>
      </div>
      <DropDownMainMenu isMenuVisible={isMenuVisible} menuRef={menuContentRef}/>

      <Modal
        title="New Post"
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okText="Share"
        cancelText="Cancel"
        confirmLoading={submitting}
        className="dark-modal"
      >
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <Select
            placeholder="Select Category"
            style={{ flex: 1 }}
            value={selectedCategory}
            onChange={(value) => {
              setSelectedCategory(value);
              setSelectedType(undefined); // Reset type when category changes
            }}
            popupClassName="dark-select-dropdown"
          >
            {Object.keys(categoryTypes).map((cat) => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
          <Select
            placeholder="Select Type"
            style={{ flex: 1 }}
            value={selectedType}
            onChange={(value) => setSelectedType(value)}
            disabled={!selectedCategory}
            popupClassName="dark-select-dropdown"
          >
            {selectedCategory && categoryTypes[selectedCategory]?.map((type) => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </div>
        <TextArea
          rows={4}
          placeholder="Write content... (optional)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <Upload
          listType="picture"
          maxCount={1}
          beforeUpload={beforeUpload}
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
        >
          <Button icon={<UploadOutlined />}>Add Photo</Button>
        </Upload>
      </Modal>
    </div>
  );
};
export default UpperMenuBar
