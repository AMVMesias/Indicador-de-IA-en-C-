#include <iostream>

using namespace std;

int main()
{
long i,sum=0,k, x, max, mini;

cin>> k >> x;
max=x;
mini=x;
for (i=1;i<=k;i++)
{
sum+=x;
if (x<mini)
{
mini=x;
}
if (x>max)
{
max=x;
}
cin >> x;
}
cout << mini << " " << max << " " << sum<< endl;
return 0;
}
