#include <stdio.h>

void f(int n) {
	int x;
	if(n<1) return;
	scanf("%d", &x);
	f(n-1);
	printf("%d ", x);
}

int main() {
	int n, x;
	scanf("%d\n%d", &n, &x);
	f(n-1);
    printf("%d\n", x);
}
