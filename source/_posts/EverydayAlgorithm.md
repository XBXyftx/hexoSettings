---
title: 每日算法
date: 2025-11-28 17:09:19
tags:
  - 算法
  - 技术向
cover: /imgs/ArticleTopImgs/EverydayAlgorithmTopImg.png
top: 18
description: 每天都要刷算法！！！
typewriter: 这篇文章将会记录我所刷的算法题！！！我一定要刷算法！！！
post_copyright:
copyright_author: XBXyftx
copyright_author_href: https://github.com/XBXyftx
copyright_url: https://xbxyftx.top
copyright_info: 此文章版权归XBXyftx所有，如有转载，请註明来自原作者
---

## 前言

这篇的前言就简介一些吧，在观摩了孙妈的面试之后我意识到我需要练算法！！！OK，就这么多，直接开始正文吧。

## 题目

语言选择上并没有ArkTS所以我就选择最相近的TS吧。

### 合并两个有序数组（简单）

![40](EverydayAlgorithm/40.png)

第一次尝试：

```ts
/**
 Do not return anything, modify nums1 in-place instead.
 */
function merge(nums1: number[], m: number, nums2: number[], n: number): void {
    let currentNums2Pointer:number=0
    nums1.forEach((num,index)=>{
        if(num>nums2[currentNums2Pointer]){
            nums1.splice(index,0,nums2[currentNums2Pointer])
            nums1.pop()
            currentNums2Pointer++
        }
    })

};
```

![1](EverydayAlgorithm/1.png)

![2](EverydayAlgorithm/2.png)

![3](EverydayAlgorithm/3.png)

这里我们分析一下测试用例。

在三个测试用例中我们通过了一个仅有一个数字的，同时在第一个测试用例中我们可以看到，其实我们当前的大小比较然后插入的这套逻辑是行得通的，两个错误的用例的共同点在于其结尾都是有0的存在，说明我们的算法仅能处理nums1中需要合并的元素，而无法正确处理仅作为占位的0元素。

所以接下来我们需要判断一下当前元素是否为占位符。

```ts
/**
 Do not return anything, modify nums1 in-place instead.
 */
function merge(nums1: number[], m: number, nums2: number[], n: number): void {
    let currentNums2Pointer:number=0
    for(let i = 0;i<nums1.length-1;i++){
        if(nums1[i]===0){
            let leftNumNumber:number=nums1.length-i-1
            let addNums:number[] = nums2.splice(0,currentNums2Pointer)
            nums1.splice(i,leftNumNumber,...addNums)
            break
        }
        if(nums1[i]>nums2[currentNums2Pointer]){
            nums1.splice(i,0,nums2[currentNums2Pointer])
            nums1.pop()
            currentNums2Pointer++
        }
    }
};
```

![4](EverydayAlgorithm/4.png)

![5](EverydayAlgorithm/5.png)

这里可以看到我们的核心问题出现在了对于末尾的0依旧没能完好的处理，但是我们仔细观察会发现其实当前的结果于上一次测试的结果已经出现差异，上一次测试用例一我们没有处理任何0元素，导致5没有被正确添加，但现在可以看到5成功添加了，这说明我们的算法对于消0补数是有一定效果的，让我们来画图推演一下。

![6](EverydayAlgorithm/6.png)

通过一步步的推到会发现问题出现在了批处理删除末尾0的操作中，我们当前算法会以外的少算一个0，因为我只考虑了当前0之后会有几个零没考虑到当前0也需要被消除。

```ts
/**
 Do not return anything, modify nums1 in-place instead.
 */
function merge(nums1: number[], m: number, nums2: number[], n: number): void {
    let currentNums2Pointer:number=0
    for(let i = 0;i<nums1.length-1;i++){
        if(nums1[i]===0){
            let leftNumNumber:number=nums1.length-i
            let addNums:number[] = nums2.splice(0,currentNums2Pointer)
            nums1.splice(i,leftNumNumber,...addNums)
            break
        }
        if(nums1[i]>nums2[currentNums2Pointer]){
            nums1.splice(i,0,nums2[currentNums2Pointer])
            nums1.pop()
            currentNums2Pointer++
        }
    }
};
```

![7](EverydayAlgorithm/7.png)

我们现在着重分析一下测试用例1即可，当前的结果中存在两个问题，一方面是数组总长度少1，另一方面是末尾的添加数字是2。其实这两者仔细分析之后会发现是同一个问题，我们需要消掉的两个0已经被修正后的计数器正确的修复了，但是插入的数字却是被删除的2，这时我突然想到pop函数返回的返回值是被删除的数字，这是之前开发以及数据结构中学习栈结构是学到的，那splice函数是不是也是返回的被删除的数组？

![8](EverydayAlgorithm/8.png)

啊，果然，返回的是被删除的。

```ts
/**
 Do not return anything, modify nums1 in-place instead.
 */
function merge(nums1: number[], m: number, nums2: number[], n: number): void {
    let currentNums2Pointer:number=0
    for(let i = 0;i<nums1.length-1;i++){
        if(nums1[i]===0){
            let leftNumNumber:number=nums1.length-i
            nums2.splice(0,currentNums2Pointer)
            nums1.splice(i,leftNumNumber,...nums2)
            break
        }
        if(nums1[i]>nums2[currentNums2Pointer]){
            nums1.splice(i,0,nums2[currentNums2Pointer])
            nums1.pop()
            currentNums2Pointer++
        }
    }
};
```

![9](EverydayAlgorithm/9.png)

![10](EverydayAlgorithm/10.png)

嘶，用例三又错了，这是为什么呢。

![11](EverydayAlgorithm/11.png)

![12](EverydayAlgorithm/12.png)

在点击了一次下一行之后代码直接运行到了最后一行，说明我们的for循环没有被执行！！！

仔细看了一下`for(let i = 0;i<nums1.length-1;i++)`这个for循环确实会出现最后一位无法被遍历的情况，用例2恰好是无需变动所以通过了，案例1是因为在遍历到0的时候就直接进行后续批处理了，跳过了最后一位的遍历导致没发现这个问题，案例3则是因为遍历第一位时就是最后一位所以发现了这个问题。

```ts
/**
 Do not return anything, modify nums1 in-place instead.
 */
function merge(nums1: number[], m: number, nums2: number[], n: number): void {
    let currentNums2Pointer:number=0
    for(let i = 0;i<nums1.length;i++){
        if(nums1[i]===0){
            let leftNumNumber:number=nums1.length-i
            nums2.splice(0,currentNums2Pointer)
            nums1.splice(i,leftNumNumber,...nums2)
            break
        }
        if(nums1[i]>nums2[currentNums2Pointer]){
            nums1.splice(i,0,nums2[currentNums2Pointer])
            nums1.pop()
            currentNums2Pointer++
        }
    }
};
```

这次可以提交测试了。

![13](EverydayAlgorithm/13.png)

！！！原来除了在末尾的0以外中间也会出现0。那这就意味着我不能再依赖于0的存在来判断是否需要进行批处理了，这不合理。（不要盲目依仗示范案例啊啊啊）

那对于这种情况来说，我需要彻底的舍弃原有的算法思路。

我顺着原本的正向对比插入的思路想到了一种方式，就是先建一个新的临时数组存储当前结果，然后仅仅去从数组一的前m项取数，设置这样一个双指针匹配插入机制。

```ts
/**
 Do not return anything, modify nums1 in-place instead.
 */
function merge(nums1: number[], m: number, nums2: number[], n: number): void {
    let resultNumList:number[] = []
    let pointer1:number = 0
    let pointer2:number = 0
    nums1.splice(m,n)
    while(1){
        if(pointer1>m){
            nums2.splice(0,pointer2)
            resultNumList.push(...nums2)
            break
        }
        if(pointer2>m){
            nums1.splice(0,pointer1)
            resultNumList.push(...nums1)
            break
        }
        if(nums1[pointer1]<nums2[pointer2]){
            resultNumList.push(nums1[pointer1])
            pointer1++
        }else{
            resultNumList.push(nums2[pointer2])
            pointer2++
        }
    }
    nums1 = resultNumList
};
```

代码很简单易懂直接执行一下进行尝试。

![14](EverydayAlgorithm/14.png)

这里发现全部测试用例都输出的空数组，这很不正常。肯定是在哪里出现了异常。

奥，我的标识符写错了，我把数组二的标识符也写成1的了，然后判断是否遍历完成应该使用等于而不是大于，因为当其处于等于长度的时候已经越界了。修正一下。

```ts
/**
 Do not return anything, modify nums1 in-place instead.
 */
function merge(nums1: number[], m: number, nums2: number[], n: number): void {
    let resultNumList:number[] = []
    let pointer1:number = 0
    let pointer2:number = 0
    nums1.splice(m,n)
    while(1){
        if(pointer1>=m){
            nums2.splice(0,pointer2)
            resultNumList.push(...nums2)
            break
        }
        if(pointer2>=n){
            nums1.splice(0,pointer1)
            resultNumList.push(...nums1)
            break
        }
        if(nums1[pointer1]<nums2[pointer2]){
            resultNumList.push(nums1[pointer1])
            pointer1++
        }else{
            resultNumList.push(nums2[pointer2])
            pointer2++
        }
    }
    nums1 = resultNumList
};
```

![15](EverydayAlgorithm/15.png)

首先观察了一下这两个的测试用例的输出结果。两者的共同点在于nums2的数均没有被写进结果数组中，这说明我当前对于nums2的写入逻辑有误。

但在审查了一遍之后我并不认为是对元素插入的逻辑有误，而是对于结果的修改方式有误，因为这一次我的结果是通过一个新的数组覆盖原有数组的方式实现的，虽然题目中提示了无需返回值，仅需要使nums1的值被修改为结果值就行。

此前我一直是直接对nums1本身进行修改，从而忽略了一个问题，在TS语言中数组是一个引用类型，我们的变量nums1仅仅是一个引用值，我们用新的结果数组直接赋值修改的仅仅是nums1的引用，相当于全部修改都落到了新数组的内存地址上，我们需要使用深拷贝去在不改变引用的前提下，去修改nums1对应的内存值。

```ts
/**
 Do not return anything, modify nums1 in-place instead.
 */
function merge(nums1: number[], m: number, nums2: number[], n: number): void {
    let resultNumList:number[] = []
    let pointer1:number = 0
    let pointer2:number = 0
    nums1.splice(m,n)
    while(1){
        if(pointer1>=m){
            nums2.splice(0,pointer2)
            resultNumList.push(...nums2)
            break
        }
        if(pointer2>=n){
            nums1.splice(0,pointer1)
            resultNumList.push(...nums1)
            break
        }
        if(nums1[pointer1]<nums2[pointer2]){
            resultNumList.push(nums1[pointer1])
            pointer1++
        }else{
            resultNumList.push(nums2[pointer2])
            pointer2++
        }
    }
    nums1.length = 0
    nums1.push(...resultNumList)
};
```

再次测试。

![16](EverydayAlgorithm/16.png)

通过了，而且这个算法的时间复杂度是m+n。

#### 官方题解

![17](EverydayAlgorithm/17.png)

这种解法的时间复杂度较高，直接切除0再排序，但确实这种方法可能更通用一些，要是两个数组并非有序数组它就可以派上用场。

```js
var merge = function(nums1, m, nums2, n) {
    nums1.splice(m, nums1.length - m, ...nums2);
    nums1.sort((a, b) => a - b);
};
```

![18](EverydayAlgorithm/18.png)

![gif](https://assets.leetcode-cn.com/solution-static/88/1.gif)

```js
var merge = function(nums1, m, nums2, n) {
    let p1 = 0, p2 = 0;
    const sorted = new Array(m + n).fill(0);
    var cur;
    while (p1 < m || p2 < n) {
        if (p1 === m) {
            cur = nums2[p2++];
        } else if (p2 === n) {
            cur = nums1[p1++];
        } else if (nums1[p1] < nums2[p2]) {
            cur = nums1[p1++];
        } else {
            cur = nums2[p2++];
        }
        sorted[p1 + p2 - 1] = cur;
    }
    for (let i = 0; i != m + n; ++i) {
        nums1[i] = sorted[i];
    }
};
```

复杂度分析

时间复杂度：O(m+n)。
指针移动单调递增，最多移动 m+n 次，因此时间复杂度为 O(m+n)。

空间复杂度：O(m+n)。
需要建立长度为 m+n 的中间数组 sorted。

啊对的对的对的对的，这就是我用的解法。

![19](EverydayAlgorithm/19.png)

```js
var merge = function(nums1, m, nums2, n) {
    let p1 = m - 1, p2 = n - 1;
    let tail = m + n - 1;
    var cur;
    while (p1 >= 0 || p2 >= 0) {
        if (p1 === -1) {
            cur = nums2[p2--];
        } else if (p2 === -1) {
            cur = nums1[p1--];
        } else if (nums1[p1] > nums2[p2]) {
            cur = nums1[p1--];
        } else {
            cur = nums2[p2--];
        }
        nums1[tail--] = cur;
    }
};
```

这个方法确实是比我的解法更加优质，它针对于当前题目的顺序数组的特点定制了从后向前倒序遍历的方式进行插入，这样既避免了nums1中包含需要合并的非占位0，同时又避免了单独创建一个临时数组提升空间复杂度。

其实对于算法核心就是在于“时间”“空间”“难易度”三者之间的平衡，简单的算法必然是需要更多的时间和空间去完成，而复杂的算法则可以使用数学逻辑上的简化用更少的时间和空间去完成。最简单的暴力合并并排序，确确实实是很简单很泛用，但是它排序的过程浪费了原数组本就是有序数组的这个天然优势，造成了时间复杂度和空间复杂度的激增。而对于我的解法则是用时间换空间，用一个m+n长度的数组节省了再次排序的时间花费。最后对于双指针倒序插入的最优解则是对于数组本身的特点进行了数学推导从而获得了更加简洁高效的逻辑替代，从而在不增加空间复杂度的同时保持了时间复杂度的优势。

### 移除元素（简单）

![20](EverydayAlgorithm/20.png)

```ts
function removeElement(nums: number[], val: number): number {
    let length:number = nums.length
    let indexs:number[] = []
    for(let i=0;i<length;i++){
        if(nums[i]===val){
            indexs.push(i)
        }
    }
    indexs.forEach((i:number)=>{
        nums.splice(i,1)
    })
    nums.length=length
    return indexs.length
}
```

先整体遍历一遍去除所有相同数字的索引，然后再去进行删除，最后将长度补齐。

![21](EverydayAlgorithm/21.png)

![22](EverydayAlgorithm/22.png)

这里我很快就发现问题，当i索引被消除之后，后续的数字都会减小索引，这就导致我所消除的数字并不是我所期望的索引。

```ts
function removeElement(nums: number[], val: number): number {
    let length:number = nums.length
    let indexs:number[] = []
    for(let i=0;i<length;i++){
        if(nums[i]===val){
            indexs.push(i)
        }
    }
    indexs.forEach((i:number,index:number)=>{
        nums.splice(i-index,1)
    })
    nums.length=length
    return indexs.length
}
```

这里我还注意到了另一个问题，就是在返回值上。题目要求的返回值是删除后剩余的数量，但是我返回的是删除的数量。

```ts
function removeElement(nums: number[], val: number): number {
    let length:number = nums.length
    let indexs:number[] = []
    for(let i=0;i<length;i++){
        if(nums[i]===val){
            indexs.push(i)
        }
    }
    indexs.forEach((i:number,index:number)=>{
        nums.splice(i-index,1)
    })
    nums.length=length
    return nums.length-indexs.length
}
```

![23](EverydayAlgorithm/23.png)

![24](EverydayAlgorithm/24.png)

![25](EverydayAlgorithm/25.png)

直接就是一波通过。

#### 官方题解2

![26](EverydayAlgorithm/26.png)

哦双指针，有意思，这种方式确实是在数据结构课上提到过，我有印象。很好理解，就是一个指针用于遍历，一个指针在前面等着将后面的非删除元素拉到前面，由于后面的删除元素流出的空缺并不需要排序或是用特定方式补全，所以我只需要单纯的覆盖前面的数据就可以，连单独保留一份数据的变量内存都不需要占据。

![27](EverydayAlgorithm/27.png)

从两个方向向中间夹，只判定左侧是否为删除值，哇哦，这种方式确实更加快捷，两个指针合起来的总路程最大也仅仅是数组长度，而单向双指针则会出现右指针遍历一遍，最坏情况左指针也需要遍历一遍，这就导致了单向双指针的最坏时间复杂度是O(2n)，而双指针最坏时间复杂度则是O(n)。

我要亲手去实验一次这个双向指针算法。

```ts
function removeElement(nums: number[], val: number): number {
    let leftPointer:number = 0
    let rightPointer:number = nums.length-1
    let removeElementNum:number=0
    while(leftPointer<=rightPointer){
        if(nums[leftPointer]===val){
            nums[leftPointer]=nums[rightPointer]
            rightPointer--
            removeElementNum++
            continue
        }else if(nums[leftPointer]!==val){
            leftPointer++
            continue
        }
    }
    return nums.length-removeElementNum
}
```

牛逼卧槽，直接一遍过，原来思路清晰解起来这么快。

![28](EverydayAlgorithm/28.png)

### 删除有序数组中的重复项（简单）

![29](EverydayAlgorithm/29.png)

```ts
function removeDuplicates(nums: number[]): number {
    let leftPointer:number = 0
    let rightPointer:number = 1
    while(rightPointer<nums.length&&leftPointer<=rightPointer){
        if(nums[leftPointer]===nums[rightPointer]){
            rightPointer++
            continue
        }else if(nums[leftPointer]!==nums[rightPointer]){
            nums.splice(leftPointer+1,rightPointer-leftPointer-1)
            leftPointer++
            continue
        }
    }
    return nums.length
};
```

在前两道题的熏陶下我第一次想到的就是使用双指针去进行处理，一个去逐一遍历，一个去标志重复的起始点。

![30](EverydayAlgorithm/30.png)

在测试的时候测试用例全部通过。

测试用例1：`[1,1,2]`
测试用例2：`[0,0,1,1,1,2,2,3,3,4]`

这两者的测试全部通过，但是提交后我在362个用例中通过了135个案例，对于这种通过一部分另一部分没通过的情况一般来讲都是整体的算法思路没有大问题但是对于某些特殊值的特化处理出现了问题，像是边界值。

我反思了一遍我对于整体指针行迹的处理，有一个问题就是在判定是否需要消除时是需要移动到连续重复数字区间后一位的位置后才会触发消除，但是这会导致最后一个延续到数组结束的重复数值区间并不会触发消除。

```ts
function removeDuplicates(nums: number[]): number {
    let leftPointer:number = 0
    let rightPointer:number = 1
    while(rightPointer<nums.length&&leftPointer<=rightPointer){
        if(rightPointer===nums.length-1){
            nums.splice(leftPointer+1,rightPointer-leftPointer)
            break
        }
        if(nums[leftPointer]===nums[rightPointer]){
            rightPointer++
            continue
        }else if(nums[leftPointer]!==nums[rightPointer]){
            nums.splice(leftPointer+1,rightPointer-leftPointer-1)
            leftPointer++
            continue
        }
    }
    return nums.length
};
```

![31](EverydayAlgorithm/31.png)

在添加了边界控制之后发现依旧是半错半对的情况，这说明我们还没有考虑到位，但与此同时通过的测试用例个数也发生了变化，这说明我们当前的改动是有效的，但仍存在问题。

![32](EverydayAlgorithm/32.png)

可以看到这种边界控制是存在严重问题的。冷静分析一下，对于这种情况我们可以将达到数据边界的情况分为左右指针值相等和左右指针值不等两种情况。

```ts
function removeDuplicates(nums: number[]): number {
    let leftPointer:number = 0
    let rightPointer:number = 1
    while(rightPointer<nums.length&&leftPointer<=rightPointer){
        if(rightPointer===nums.length-1){
            if(nums[leftPointer]===nums[rightPointer]){
                nums.splice(leftPointer+1,rightPointer-leftPointer)
                break
            }else{
                nums.splice(leftPointer+1,rightPointer-leftPointer-1)
                break
            }
        }
        if(nums[leftPointer]===nums[rightPointer]){
            rightPointer++
            continue
        }else if(nums[leftPointer]!==nums[rightPointer]){
            nums.splice(leftPointer+1,rightPointer-leftPointer-1)
            leftPointer++
            continue
        }
    }
    return nums.length
};
```

这一次的修改，我将边界控制的情况进行了细分，分别处理了左右指针值相等和不等的情况。

相等时就删除包含右指针自身在内的值，不同则删除左右指针中间的数。

![33](EverydayAlgorithm/33.png)

我们通过的测试用例上涨了，说明这个改动是有效的但还是又欠缺。此时我又想到了另一个问题，就是在于将元素删除后右指针和左指针之间的间隔出现了异常的跨度。

![34](EverydayAlgorithm/34.png)

像是这样的情况会出现将下一个重复区间给拉到无法被监测的区间中。所以在删除完后我们还需要将右指针拉回到左指针位置。

```ts
function removeDuplicates(nums: number[]): number {
    let leftPointer:number = 0
    let rightPointer:number = 1
    while(rightPointer<nums.length&&leftPointer<=rightPointer){
        if(rightPointer===nums.length-1){
            if(nums[leftPointer]===nums[rightPointer]){
                nums.splice(leftPointer+1,rightPointer-leftPointer)
                break
            }else{
                nums.splice(leftPointer+1,rightPointer-leftPointer-1)
                break
            }
        }
        if(nums[leftPointer]===nums[rightPointer]){
            rightPointer++
            continue
        }else if(nums[leftPointer]!==nums[rightPointer]){
            nums.splice(leftPointer+1,rightPointer-leftPointer-1)
            leftPointer++
            rightPointer=leftPointer
            continue
        }
    }
    return nums.length
};
```

![35](EverydayAlgorithm/35.png)

![36](EverydayAlgorithm/36.png)

![37](EverydayAlgorithm/37.png)

#### 官方题解3

<video width="100%" controls>
  <source src="38.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

！！！我勒个豆，在和孙妈深度的聊了一下才发现我有点过度依赖`splice`的这个内置函数了，它在处理数组时会移动大量数组元素的索引，导致索引上的异常变化，而为了处理这种异常变化我需要用大量的边界处理来去调整索引。

我要回归基本功的去试试，用最基础的形式去进行一下尝试了。

首先双指针是正确的，问题是在于我无需删改原本的数组长度，我只需要逐一找到不重复的元素去覆盖到前面的位置就好。

```ts
function removeDuplicates(nums: number[]): number {
    let leftPointer:number = 0
    let rightPointer:number = 1
    while(rightPointer<nums.length){
        if(nums[leftPointer]===nums[rightPointer]){
            rightPointer++
            continue
        }else{
            nums[++leftPointer]=nums[rightPointer++]
        }
    }
    return leftPointer+1
};
```

`nums[++leftPointer]=nums[rightPointer++]`超绝细节处理！！！

![39](EverydayAlgorithm/39.png)

两者的时间空间复杂度是一致的，和我原本程序的一样。

### 删除有序数组中的重复项2（中等）

这将会是我做的第一个中等难度的题，让我来试一试。

![42](EverydayAlgorithm/42.png)
