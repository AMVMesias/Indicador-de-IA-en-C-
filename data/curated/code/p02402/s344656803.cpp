#include<iostream>                    
using namespace std;
int main(){
 
  int n,a[10000],i,s(1000000),b(-1000000);
  long long w=0;
  cin>>n;
  for(int i=0;i<n; i++)
  {
         cin>>a[i];
 
           w+=a[i];
		   
         if(s>a[i])
         {
	       s=a[i];
         }
        if(b<a[i])
         {      

	         b=a[i];

		}
  
  }
  cout<<s<<" "<<b<<" "<<w<<endl;


  return 0;
  }  

