//
//  main.cpp
//  zero
//
//  Created by 叶金炜 on 2019/4/2.
//  Copyright © 2019 okstal. All rights reserved.
//

#include <iostream>
#include <cstdio>
#include <algorithm>
#include <cmath>
#include <string.h>
#include <string>
#define pi acos(-1)
using namespace std;
int main()
{
    char a[1007];
    while(~scanf("%s",a))
    {
        if(a[0]=='0')break;
        int sum=0;
        for(int i=0;i<strlen(a);i++)sum+=(a[i]-48);
        cout<<sum<<endl;
    }
    return 0;
}

