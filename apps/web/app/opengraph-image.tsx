import { ImageResponse } from 'next/og'
export const size={width:1200,height:630};export const contentType='image/png'
export default function Image(){return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',padding:'80px',background:'#05070a',color:'#f4f7fb',fontFamily:'sans-serif'}}><div style={{display:'flex',flexDirection:'column'}}><div style={{fontSize:28,color:'#58bfff',letterSpacing:4}}>NEPTLIUM</div><div style={{fontSize:78,letterSpacing:-4,marginTop:48,maxWidth:900}}>Capital, organized around you.</div><div style={{fontSize:24,color:'#8f9baa',marginTop:34}}>Capital operating infrastructure for modern ownership.</div></div></div>) }

