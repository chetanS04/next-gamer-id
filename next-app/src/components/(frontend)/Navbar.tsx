'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RiLogoutCircleRLine, RiSearch2Fill } from 'react-icons/ri';

import gamePic from '@/public/man.png'
import Image from 'next/image'
import logo from '@/public/final.png'
import { FaCaretDown } from 'react-icons/fa';
import { Menu, PlusCircle, StoreIcon, Wallet, X } from 'lucide-react';
import { TbLayoutDashboardFilled } from 'react-icons/tb';
import axios from '../../../utils/axios';
// import WalletBalance from '../WalletBalance';



const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isOpenMenu, setOpenMenu] = useState(false)
  const [isCollaps, setCollaps] = useState(false)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleDashboardRedirect = () => {
    switch (user?.role) {
      case "Admin":
        router.push("/dashboard");
        break;
      case "Buyer":
        router.push("/buyer-dashboard");
        break;
      case "Seller":
        router.push("/seller-dashboard");
        break;
      default:
        router.push("/login");
        break;
    }
  };


  useEffect(() => {
    getWalletBalance()
  })

  const getWalletBalance = async () => {
    const response = await axios.get('/api/wallet/balance')
    setBalance(response.data.balance)
    console.log(response.data)
  }

  const navLinks = [
    {
      link: '/',
      name: 'Games'
    },

    {
      link: '/',
      name: 'Promo & Events'
    },
    {
      link: '/about',
      name: 'About'
    },
    {
      link: '/contact-us',
      name: 'Contact Us'
    },


  ]
  const menuList = [
    { name: 'Login', link: '/login' },
    { name: 'Register', link: '/register' },
  ]

  const showMenu = () => {
    setOpenMenu(!isOpenMenu);
  }
  const collapsMenu = () => {
    setCollaps(!isCollaps);
  }

  const handleClick = () => {
    router.push("/wallet"); // redirect to wallet page
  };


  const handleClicks = () => {
    router.push("/seller-store"); // redirect to wallet page
  };


  return (
    <>
      <header className='p-4 text-white '>
        <nav className='flex justify-between'>
          <div className="logoSearch flex gap-5 justify-between items-center">
            <Link href="/" className='logo italic font-bold h-[3.5rem]  max-w-[17.5rem] min-w-[9.375rem] text-4xl text-white'>
              <Image src={logo} alt='Logo' className='h-full w-full object-contain' />
            </Link>
            <label htmlFor='search' className='bg-gc-900 h-[3.5rem] shadow-lg shadow-white/5 max-xl:hidden flex justify-start items-center gap-3 p-4 rounded-full placeholder:text-white  text-white w-[300px]'>
              <RiSearch2Fill className='text-gc-300' />
              <input id='search' type="search" className='flex-1 !appearance-none  !outline-none !shadow-none !border-none' placeholder='What are you looking for?' />
            </label>
          </div>
          <div onClick={collapsMenu} className={`layer lg:hidden fixed z-[1198] h-full w-full top-0 ${isCollaps ? 'left-0' : '-left-full'}`}></div>
          <div className={`ms-auto px-4 flex justify-center items-center max  max-lg:fixed  max-lg:top-0 transition-all duration-300 ${isCollaps ? 'max-lg:left-[0px]' : 'max-lg:left-[-410px]'} max-lg:h-[100dvh] max-lg:max-w-[400px] max-lg:w-full max-lg:bg-gc-900  max-lg:flex-col  max-lg:justify-start  max-lg:items-stretch  max-lg:z-[1199]`}>
            <div className="flex justify-between items-center lg:hidden">
              <Link href="/" className='logo italic font-bold h-[3.5rem]  max-w-[17.5rem] min-w-[9.375rem] text-4xl text-white'>
                <Image src={logo} alt='Logo' className='h-full w-full object-contain' />
              </Link>

              <X onClick={collapsMenu} className='text-white size-8 cursor-pointer' />
            </div>
            <ul className='flex lg:shadow-lg shadow-white/5 justify-center items-center rounded-full h-full w-full bg-gc-900 px-10 max-lg:flex-col max-lg:items-stretch max-lg:justify-start  max-lg:py-5 max-lg:px-0'>
              {navLinks.map((link, index) => (
                <li key={index} className={`lg:h-full  max-lg:mb-1 group`}>
                  <Link href={link.link} className='flex justify-start items-center gap-0 px-5 h-full transition-all duration-300 hover:text-gc-900 max-lg:px-4 max-lg:py-3 max-lg:hover:!px-7 relative z-0'>
                    <div className="absolute inset-0 bg-white z-[-1] skew-x-0 group-hover:-skew-x-12 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <span className='text-nowrap font-bold'>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          <div className='flex justify-center gap-4'>


            {/* Wallet Icon Circle */}
            {user && (user.role === "Seller" || user.role === "Admin" || user.role === "Buyer") && (

              <Link href="/wallet">
                <div className="bg-gc-900 h-[3.5rem] shadow-lg shadow-white/5 aspect-square rounded-full flex justify-center items-center overflow-hidden cursor-pointer hover:shadow-white/10 transition">
                  <Wallet className="text-white size-6" />
                </div>
              </Link>
            )}
            {/* Store Icon Circle */}
            {user && (user.role === "Seller") && (
              <Link href="/seller-store">
                <div className="bg-gc-900 h-[3.5rem] shadow-lg shadow-white/5 aspect-square rounded-full flex justify-center items-center overflow-hidden cursor-pointer hover:shadow-white/10 transition">
                  <StoreIcon className="text-white size-6" />
                </div>
              </Link>
            )}
          </div>



          <div className='flex justify-center gap-4'>
            <div className={` relative`}>
              <div onClick={showMenu}>
                {user ? (
                  <div className="bg-gc-900 h-[3.5rem] shadow-lg shadow-white/5 aspect-square rounded-full flex justify-center items-center overflow-hidden">
                    <strong className='text-2xl'>{user.name?.charAt(0).toUpperCase() || "U"}</strong>
                  </div>
                ) : (
                  <div className="bg-gc-900 h-[3.5rem] shadow-lg shadow-white/5 px-10 flex justify-center items-center gap-1 rounded-full overflow-hidden">
                    <span>Login</span>
                    <FaCaretDown className={`size-4 transition-all duration-300 ${isOpenMenu ? 'rotate-180' : 'rotate-0'}`} />
                  </div>
                )}
              </div>











              <div className={`grid transition-all duration-300 absolute z-[999] mt-2 max-w-[250px]  min-w-[250px] top-full right-0 ${isOpenMenu ? ' grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden bg-gc-900 shadow-lg shadow-white/5 rounded-xl">
                  {user ? (
                    <ul onMouseLeave={showMenu} className='p-1 divide-y divide-gc-300'>
                      <li className='px-2'>
                        <div className="bg-gc-900 rounded-full flex gap-3 justify-start items-center p-2">
                          <div className="h-full  max-h-[3rem] min-h-[3rem] rounded-full aspect-square overflow-hidden">
                            <Image src={gamePic} alt='user profile' className=' h-full w-full object-cover' />
                          </div>
                          <div>
                            <h5 className='text-base text-nowrap'><strong>{user.name}</strong></h5>
                            <h6 className='text-xs'>{user?.role}</h6>
                          </div>
                        </div>
                      </li>
                      <li className={`h-full py-4 px-5`}>


                        <button onClick={handleDashboardRedirect} className='flex justify-between items-center gap-2 transition-colors duration-100 cursor-pointer hover:text-gc-300 w-full'>
                          <span>Dashboard</span>
                          <TbLayoutDashboardFilled className='size-5' />
                        </button>
                      </li>


                      <li className={`h-full py-4 px-5`}>

                        <button
                          onClick={handleClick}
                          className="flex justify-between items-center gap-2 transition-colors duration-100 cursor-pointer hover:text-gc-300 w-full"
                        >
                          <span>Wallet Balance</span>
                          <span>${balance ?? "0.00"}</span>
                          <PlusCircle className="size-5" />
                        </button>
                      </li>



                      {user && (user.role === "Seller") && (

                        <li className={`h-full py-4 px-5`}>

                          <button
                            onClick={handleClicks}
                            className="flex justify-between items-center gap-2 transition-colors duration-100 cursor-pointer hover:text-gc-300 w-full"
                          >
                            <span>My Store</span>
                            <StoreIcon className="size-5" />
                          </button>
                        </li>
                      )}


                      <li className={`h-full py-4 px-5`}>
                        <button type='button' onClick={handleLogout} className='flex justify-between items-center gap-2 transition-colors duration-100 cursor-pointer hover:text-red-300 w-full'>
                          <span>Logout</span>
                          <RiLogoutCircleRLine className='size-5' />
                        </button>
                      </li>
                    </ul>
                  ) : (
                    <ul onMouseLeave={showMenu} className='p-5 divide-y divide-gc-300'>
                      {menuList.map((link, index) => (
                        <li key={index} className={`h-full py-4`}>
                          <Link href={link.link} className='flex justify-start items-center gap-2 transition-colors duration-100 hover:text-gc-300'>
                            <span>{link.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                </div>







              </div>
            </div>

            <div onClick={collapsMenu} className="bg-gc-900 lg:hidden h-[3.5rem] aspect-square rounded-full flex justify-center items-center overflow-hidden">
              <Menu />
            </div>
          </div>



        </nav>

      </header>
    </>
  );
};

export default Navbar;



